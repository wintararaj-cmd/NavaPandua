
import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, BookOpen, Clock, Award, FileSpreadsheet, 
    Settings, Download, User, CheckCircle, FileText, ChevronRight,
    ArrowRightCircle, Filter, FilterIcon
} from 'lucide-react';
import { examService, type Exam, type ExamGrade, type ExamSchedule, type ExamResult } from '../services/examService';
import { studentService } from '../services/studentService';
import { classService, type Class, type Section } from '../services/classService';
import ExamModal from '../components/exams/ExamModal';
import ExamScheduleModal from '../components/exams/ExamScheduleModal';
import toast from 'react-hot-toast';

export default function Exams() {
    const [activeTab, setActiveTab] = useState<'exams' | 'grades' | 'schedules' | 'results' | 'report-cards'>('exams');
    const [loading, setLoading] = useState(false);

    const [exams, setExams] = useState<Exam[]>([]);
    const [grades, setGrades] = useState<ExamGrade[]>([]);
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
    
    // Filters for results/report cards
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [students, setStudents] = useState<any[]>([]);

    const [showExamModal, setShowExamModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTabContent();
    }, [activeTab]);

    const fetchInitialData = async () => {
        try {
            const [cData, eData] = await Promise.all([
                classService.getClasses(),
                examService.getExams()
            ]);
            setClasses(cData.results || []);
            setExams(eData.results || []);
        } catch { toast.error('Failed to load filters'); }
    };

    const fetchTabContent = async () => {
        try {
            setLoading(true);
            if (activeTab === 'exams') {
                const data = await examService.getExams();
                setExams(data.results || []);
            } else if (activeTab === 'grades') {
                const data = await examService.getGrades();
                setGrades(data.results || []);
            } else if (activeTab === 'schedules') {
                const data = await examService.getSchedules();
                setSchedules(data.results || []);
            }
        } catch (error) {
            toast.error('Failed to fetch exam data');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadStudents = async () => {
        if (!selectedClass) { toast.error('Please select a class'); return; }
        try {
            setLoading(true);
            const res = await studentService.getStudents({ current_class: selectedClass });
            setStudents(res.results || []);
        } catch { toast.error('Failed to load students'); }
        finally { setLoading(false); }
    };

    const handleDownloadReportCard = async (examId: string, studentId: string, studentName: string) => {
        if (!examId) { toast.error('Please select an exam first'); return; }
        try {
            toast.loading('Generating PDF...', { id: 'pdf' });
            const blob = await examService.downloadReportCard(examId, studentId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ReportCard_${studentName.replace(' ', '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report Card Downloaded', { id: 'pdf' });
        } catch (err: any) {
            toast.error('Failed to download report card. Check if results are entered.', { id: 'pdf' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Examination Management</h1>
                <div className="flex bg-white rounded-xl shadow-sm border p-1 gap-1">
                    {[
                        { id: 'exams', label: 'Exams', icon: BookOpen },
                        { id: 'schedules', label: 'Schedules', icon: Clock },
                        { id: 'results', label: 'Marks', icon: FileSpreadsheet },
                        { id: 'report-cards', label: 'Reports', icon: FileText },
                        { id: 'grades', label: 'Grades', icon: Award },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden p-6">
                {activeTab === 'exams' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Active Exams</h3>
                            <button onClick={() => setShowExamModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-bold transition">
                                <Plus className="h-4 w-4" /> Create Exam
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="border p-6 rounded-2xl bg-white hover:shadow-xl border-gray-100 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 group-hover:w-2.5 transition-all"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-gray-900 text-xl truncate pr-16">{exam.name}</h4>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${exam.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                            {exam.is_active ? 'Active' : 'Archived'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10 italic">"{exam.description || 'No description provided.'}"</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gray-50 text-gray-600 hover:bg-indigo-600 hover:text-white py-2 rounded-lg text-xs font-black transition-all">EDIT</button>
                                        <button className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white py-2 rounded-lg text-xs font-black transition-all">SCHEDULES</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'schedules' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Exam Schedules</h3>
                            <button onClick={() => setShowScheduleModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-bold transition">
                                <Plus className="h-4 w-4" /> Add Slot
                            </button>
                        </div>
                        <div className="overflow-x-auto border border-gray-50 rounded-2xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Exam', 'Subject', 'Date & Time', 'Pass / Full', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {schedules.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{s.exam_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{s.subject_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="font-bold text-indigo-600">{s.date}</div>
                                                <div className="text-gray-400">{s.start_time} ({s.duration_minutes}m)</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="font-black text-emerald-600">{s.passing_marks}</span>
                                                <span className="text-gray-400"> / {s.full_marks}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-black transition">EDIT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(activeTab === 'results' || activeTab === 'report-cards') && (
                    <div className="space-y-6">
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FilterIcon className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-black text-indigo-900 uppercase">Selection Filter</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select className="px-4 py-2.5 rounded-xl border-gray-200 border text-sm font-medium focus:ring-2 focus:ring-indigo-400 outline-none"
                                    value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select className="px-4 py-2.5 rounded-xl border-gray-200 border text-sm font-medium focus:ring-2 focus:ring-indigo-400 outline-none"
                                    value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                    <option value="">Select Exam</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                                <button onClick={handleLoadStudents} disabled={loading} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:bg-indigo-700 disabled:opacity-50">
                                    LOAD STUDENTS
                                </button>
                            </div>
                        </div>

                        {students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {students.map(s => (
                                    <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{s.user.first_name} {s.user.last_name}</h4>
                                                <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">Roll: {s.roll_number || 'NA'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto pt-4 border-t border-gray-50">
                                            {activeTab === 'results' ? (
                                                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all">
                                                    ENTER MARKS <ArrowRightCircle className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDownloadReportCard(selectedExam, s.id, `${s.user.first_name} ${s.user.last_name}`)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all"
                                                >
                                                    DOWNLOAD PDF <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-gray-400 italic">
                                {loading ? 'Fetching students...' : 'Select filters above and click Load Students'}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Grading System</h3>
                            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-bold transition">
                                <Plus className="h-4 h-4" /> Add Grade Scale
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {grades.map(g => (
                                <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                                    <div className="text-3xl font-black text-indigo-600 mb-1">{g.name}</div>
                                    <div className="text-sm font-bold text-slate-700">{g.percent_from}% - {g.percent_upto}%</div>
                                    <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-2">Point: {g.grade_point}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ExamModal isOpen={showExamModal} onClose={() => setShowExamModal(false)} onSuccess={fetchTabContent} />
            <ExamScheduleModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSuccess={fetchTabContent} />
        </div>
    );
}
