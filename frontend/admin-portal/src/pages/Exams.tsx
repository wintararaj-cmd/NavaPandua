import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, BookOpen, Clock, Award, FileSpreadsheet, 
    Settings, Download, User, CheckCircle, FileText, ChevronRight,
    ArrowRightCircle, Filter, FilterIcon, GraduationCap
} from 'lucide-react';
import { examService, type Exam, type ExamGrade, type ExamSchedule, type ExamResult } from '../services/examService';
import { studentService } from '../services/studentService';
import { classService, type Class, type Section } from '../services/classService';
import { useInstitutionTerms } from '../hooks/useInstitutionTerms';
import ExamModal from '../components/exams/ExamModal';
import ExamScheduleModal from '../components/exams/ExamScheduleModal';
import toast from 'react-hot-toast';

export default function Exams() {
    const terms = useInstitutionTerms();
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
        if (!selectedClass) { toast.error(`Please select a ${terms.classLabel.toLowerCase()}`); return; }
        try {
            setLoading(true);
            const res = await studentService.getStudents({ current_class: selectedClass });
            setStudents(res.results || []);
        } catch { toast.error(`Failed to load ${terms.studentsLabel.toLowerCase()}`); }
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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Examinations & Grading</h1>
                    <p className="text-sm font-bold text-gray-400 mt-1">Manage assessments, schedules, and official performance reports.</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shadow-inner">
                    {[
                        { id: 'exams', label: 'Overview', icon: BookOpen },
                        { id: 'schedules', label: 'Calendar', icon: Clock },
                        { id: 'results', label: 'Marks', icon: FileSpreadsheet },
                        { id: 'report-cards', label: 'Reports', icon: FileText },
                        { id: 'grades', label: 'Scales', icon: Award },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all ${activeTab === tab.id 
                                ? 'bg-white text-indigo-600 shadow-xl' 
                                : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow-2xl shadow-indigo-100/20 border border-gray-100 rounded-[32px] overflow-hidden p-2">
                <div className="p-8">
                {activeTab === 'exams' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Active Assessments</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Current Session</p>
                            </div>
                            <button onClick={() => setShowExamModal(true)} className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-xl shadow-indigo-100 font-black text-sm transition active:scale-95">
                                <Plus className="h-5 w-5" /> Create Exam
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="border p-8 rounded-[32px] bg-white hover:shadow-2xl hover:shadow-indigo-50 border-gray-100 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 group-hover:w-4 transition-all"></div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="min-w-0 pr-4">
                                            <h4 className="font-black text-gray-900 text-2xl truncate tracking-tight">{exam.name}</h4>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${exam.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                {exam.is_active ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                        <Award className="w-10 h-10 text-indigo-50 group-hover:text-indigo-100 transition-colors" />
                                    </div>
                                    <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">"{exam.description || 'Global assessment for the current academic session.'}"</p>
                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-gray-50 text-gray-500 hover:bg-gray-100 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Settings</button>
                                        <button className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">View Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'schedules' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8">
                        <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Time Slots</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Calendar Allocation</p>
                            </div>
                            <button onClick={() => setShowScheduleModal(true)} className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-xl shadow-indigo-100 font-black text-sm transition active:scale-95">
                                <Plus className="h-5 w-5" /> New Schedule
                            </button>
                        </div>
                        <div className="overflow-x-auto border border-gray-100 rounded-[32px] shadow-sm">
                            <table className="min-w-full divide-y divide-gray-50">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        {['Assessment', 'Subject', 'Date & Timing', 'Compliance', 'Action'].map(h => (
                                            <th key={h} className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {schedules.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition">
                                            <td className="px-8 py-6 whitespace-nowrap font-black text-gray-900 text-sm tracking-tight">{s.exam_name}</td>
                                            <td className="px-8 py-6 whitespace-nowrap text-gray-600 font-bold uppercase text-[10px] tracking-widest">{s.subject_name}</td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="font-black text-indigo-600 text-sm">{s.date}</div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.start_time} • {s.duration_minutes}m</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-black text-indigo-900 text-sm">{s.passing_marks}</span>
                                                    <span className="text-gray-300 font-black text-sm">/ {s.full_marks}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <button className="text-gray-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-all"><Settings className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {(activeTab === 'results' || activeTab === 'report-cards') && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-8">
                        <div className="bg-indigo-600 rounded-[32px] p-8 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-end gap-6">
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                    <FilterIcon className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Enrollment Selection</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-indigo-200 uppercase tracking-widest ml-4">{terms.classLabel}</label>
                                        <select className="w-full px-6 py-4 rounded-2xl border-none bg-white/10 text-white font-black text-sm outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
                                            value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                            <option value="">Choose {terms.classLabel}</option>
                                            {classes.map(c => <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-indigo-200 uppercase tracking-widest ml-4">Assessment</label>
                                        <select className="w-full px-6 py-4 rounded-2xl border-none bg-white/10 text-white font-black text-sm outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
                                            value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                            <option value="">Choose Exam</option>
                                            {exams.map(e => <option key={e.id} value={e.id} className="text-gray-900">{e.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                 </div>
                             </div>
                             <div className="flex gap-4">
                                 <button onClick={handleLoadStudents} disabled={loading} className="bg-white text-indigo-600 px-8 py-5 rounded-2xl font-black text-sm shadow-xl transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-50 whitespace-nowrap">
                                     SYNC RECORDS
                                 </button>
                                 <button 
                                     onClick={async () => {
                                         if (!selectedExam || !selectedClass) { toast.error('Select both exam and class'); return; }
                                         try {
                                             toast.loading('Generating Consolidated Sheet...', { id: 'pdf' });
                                             const blob = await examService.downloadConsolidatedMarksheet(selectedExam, selectedClass);
                                             const url = window.URL.createObjectURL(new Blob([blob]));
                                             const link = document.createElement('a');
                                             link.href = url;
                                             link.setAttribute('download', `Consolidated_Sheet.pdf`);
                                             document.body.appendChild(link);
                                             link.click();
                                             link.remove();
                                             toast.success('Consolidated Sheet Downloaded', { id: 'pdf' });
                                         } catch { toast.error('Failed to download sheet', { id: 'pdf' }); }
                                     }}
                                     disabled={loading || !selectedExam || !selectedClass} 
                                     className="bg-indigo-900 text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl transition-all hover:bg-indigo-950 active:scale-95 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                                 >
                                     <FileSpreadsheet className="w-5 h-5" /> CONSOLIDATED SHEET
                                 </button>
                             </div>
                         </div>

                        {students.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {students.map(s => (
                                    <div key={s.id} className="bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-indigo-50 transition-all flex flex-col group relative overflow-hidden">
                                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-indigo-50 transition-colors -z-10" />
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-gray-100 group-hover:shadow-indigo-100">
                                                <GraduationCap className="w-8 h-8" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-gray-900 text-xl truncate tracking-tight">{s.user.first_name} {s.user.last_name}</h4>
                                                <p className="text-[10px] text-gray-400 font-extrabold tracking-[0.2em] uppercase mt-1">Roll ID: {s.roll_number || 'TBD'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">
                                                <span>Session: 2024</span>
                                                <span>Status: Active</span>
                                            </div>
                                            {activeTab === 'results' ? (
                                                <button className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-100/10">
                                                    Enter Marks <ArrowRightCircle className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDownloadReportCard(selectedExam, s.id, `${s.user.first_name} ${s.user.last_name}`)}
                                                    className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-100/10"
                                                >
                                                    Generate PDF <Download className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 text-center animate-in fade-in">
                                <Award className="w-24 h-24 text-gray-100 mx-auto mb-6" />
                                <h4 className="text-2xl font-black text-gray-900 mb-2">Registry Awaiting Sync</h4>
                                <p className="text-gray-400 font-medium max-w-sm mx-auto">Please filter by {terms.classLabel.toLowerCase()} and examination type to pull current academic records.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8">
                        <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Grading Protocols</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Official Thresholds</p>
                            </div>
                            <button className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-xl shadow-indigo-100 font-black text-sm transition active:scale-95">
                                <Plus className="h-5 h-5" /> New Standard
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {grades.map(g => (
                                <div key={g.id} className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 text-center hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all group">
                                    <div className="text-5xl font-black text-indigo-600 mb-4 group-hover:scale-110 transition-transform tracking-tighter">{g.name}</div>
                                    <div className="inline-block px-4 py-1.5 bg-white rounded-full text-xs font-black text-gray-700 border border-gray-100 mb-4">{g.percent_from}% - {g.percent_upto}%</div>
                                    <div className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">Quality Point: {g.grade_point}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </div>

            <ExamModal isOpen={showExamModal} onClose={() => setShowExamModal(false)} onSuccess={fetchTabContent} />
            <ExamScheduleModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSuccess={fetchTabContent} />
        </div>
    );
}
