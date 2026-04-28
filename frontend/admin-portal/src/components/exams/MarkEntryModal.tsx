
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { examService, type ExamSchedule } from '../../services/examService';
import { studentService } from '../../services/studentService';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    examId: string;
    examName: string;
    className: string;
}

export default function MarkEntryModal({ isOpen, onClose, classId, examId, examName, className }: Props) {
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [marks, setMarks] = useState<Record<string, { marks: string; remarks: string; is_absent: boolean }>>({});

    useEffect(() => {
        if (isOpen && examId && classId) {
            fetchSchedules();
            fetchStudents();
        }
    }, [isOpen, examId, classId]);

    const fetchSchedules = async () => {
        try {
            const res = await examService.getSchedules({ exam: examId });
            setSchedules(res.results || []);
            if (res.results?.length > 0) setSelectedSchedule(res.results[0].id);
        } catch { toast.error('Failed to load exam subjects'); }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await studentService.getStudents({ current_class: classId });
            setStudents(res.results || []);
            
            // Initialize marks state if we have a selected schedule
            if (selectedSchedule) fetchExistingResults(selectedSchedule, res.results || []);
        } catch { toast.error('Failed to load students'); }
        finally { setLoading(false); }
    };

    const fetchExistingResults = async (scheduleId: string, studentList: any[]) => {
        try {
            const res = await examService.getResults({ exam_schedule: scheduleId });
            const existingMarks: any = {};
            studentList.forEach(s => {
                const found = res.results?.find((r: any) => r.student === s.id);
                existingMarks[s.id] = {
                    marks: found?.marks_obtained || '',
                    remarks: found?.remarks || '',
                    is_absent: found?.is_absent || false
                };
            });
            setMarks(existingMarks);
        } catch { console.error('Failed to fetch existing results'); }
    };

    useEffect(() => {
        if (selectedSchedule && students.length > 0) {
            fetchExistingResults(selectedSchedule, students);
        }
    }, [selectedSchedule]);

    const handleSave = async () => {
        if (!selectedSchedule) return;
        try {
            setLoading(true);
            const results = Object.entries(marks).map(([studentId, data]) => ({
                student_id: studentId,
                marks_obtained: data.marks || 0,
                remarks: data.remarks,
                is_absent: data.is_absent
            }));

            await examService.bulkSaveResults({
                exam_schedule: selectedSchedule,
                results
            });
            toast.success('Marks saved successfully');
            onClose();
        } catch (err) {
            toast.error('Failed to save marks');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentSchedule = schedules.find(s => s.id === selectedSchedule);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-indigo-50/30">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">Mark Entry</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{examName}</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Enter Marks for {className}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all hover:shadow-lg active:scale-95 group">
                        <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>

                <div className="p-8 bg-white border-b border-gray-50 flex flex-wrap gap-6 items-center">
                    <div className="space-y-1.5 flex-1 min-w-[240px]">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Select Subject / Paper</label>
                        <select 
                            value={selectedSchedule}
                            onChange={(e) => setSelectedSchedule(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none"
                        >
                            {schedules.map(s => (
                                <option key={s.id} value={s.id}>{s.subject_name} ({s.full_marks} Marks)</option>
                            ))}
                        </select>
                    </div>
                    {currentSchedule && (
                        <div className="flex gap-4">
                            <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100">
                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Full Marks</div>
                                <div className="text-xl font-black text-emerald-900">{currentSchedule.full_marks}</div>
                            </div>
                            <div className="bg-amber-50 px-6 py-4 rounded-2xl border border-amber-100">
                                <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Passing Marks</div>
                                <div className="text-xl font-black text-amber-900">{currentSchedule.passing_marks}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                    <div className="border rounded-[32px] overflow-hidden bg-white shadow-sm border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Roll</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Name</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Marks Obtained</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap font-black text-gray-400 text-sm">{student.roll_number || '-'}</td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{student.user.first_name} {student.user.last_name}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">ADM: {student.admission_number}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <label className="flex items-center gap-2 cursor-pointer group/abs">
                                                <input 
                                                    type="checkbox"
                                                    checked={marks[student.id]?.is_absent || false}
                                                    onChange={(e) => setMarks({
                                                        ...marks,
                                                        [student.id]: { ...marks[student.id], is_absent: e.target.checked, marks: e.target.checked ? '0' : marks[student.id]?.marks }
                                                    })}
                                                    className="w-5 h-5 rounded-lg border-gray-200 text-red-500 focus:ring-red-500"
                                                />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${marks[student.id]?.is_absent ? 'text-red-500' : 'text-gray-400'}`}>Absent</span>
                                            </label>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <input 
                                                type="number"
                                                disabled={marks[student.id]?.is_absent}
                                                max={currentSchedule?.full_marks}
                                                value={marks[student.id]?.marks || ''}
                                                onChange={(e) => setMarks({
                                                    ...marks,
                                                    [student.id]: { ...marks[student.id], marks: e.target.value }
                                                })}
                                                placeholder="0.00"
                                                className={`w-32 px-4 py-3 rounded-xl border border-gray-100 font-black text-sm outline-none focus:ring-4 transition-all ${marks[student.id]?.is_absent ? 'bg-gray-100 text-gray-400' : 'bg-white focus:ring-indigo-100'}`}
                                            />
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <input 
                                                type="text"
                                                value={marks[student.id]?.remarks || ''}
                                                onChange={(e) => setMarks({
                                                    ...marks,
                                                    [student.id]: { ...marks[student.id], remarks: e.target.value }
                                                })}
                                                placeholder="Add remarks..."
                                                className="w-full min-w-[200px] px-4 py-3 rounded-xl border border-gray-100 bg-white font-medium text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={loading || !selectedSchedule}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Results</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
