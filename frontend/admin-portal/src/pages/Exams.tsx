
import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Clock, Award, FileSpreadsheet, Settings } from 'lucide-react';
import { examService, type Exam, type ExamGrade, type ExamSchedule } from '../services/examService';
import ExamModal from '../components/exams/ExamModal';
import ExamScheduleModal from '../components/exams/ExamScheduleModal';
import toast from 'react-hot-toast';

export default function Exams() {
    const [activeTab, setActiveTab] = useState<'exams' | 'grades' | 'schedules' | 'results'>('exams');
    const [loading, setLoading] = useState(false);

    const [exams, setExams] = useState<Exam[]>([]);
    const [grades, setGrades] = useState<ExamGrade[]>([]);
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);

    const [showExamModal, setShowExamModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Examination Management</h1>
                <div className="flex bg-white rounded-lg shadow-sm border p-1">
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'exams' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <BookOpen className="h-4 w-4" />
                        Exams
                    </button>
                    <button
                        onClick={() => setActiveTab('schedules')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'schedules' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Clock className="h-4 w-4" />
                        Schedules
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'results' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Enter Marks
                    </button>
                    <button
                        onClick={() => setActiveTab('grades')}
                        className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${activeTab === 'grades' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Award className="h-4 w-4" />
                        Grades
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                {activeTab === 'exams' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Active Exams</h3>
                            <button
                                onClick={() => setShowExamModal(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition"
                            >
                                <Plus className="h-4 w-4" /> Create Exam
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="border p-6 rounded-xl bg-white hover:shadow-lg border-gray-100 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-gray-900 text-xl">{exam.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${exam.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {exam.is_active ? 'Active' : 'Archived'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">{exam.description || 'No description provided.'}</p>
                                    <div className="flex gap-2">
                                        <button className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition">Edit</button>
                                        <button className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition">Schedules</button>
                                    </div>
                                </div>
                            ))}
                            {exams.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No exams created yet. Start by creating an exam period.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'schedules' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Exam Schedules</h3>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Slot
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exam</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Marks</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {schedules.map(schedule => (
                                        <tr key={schedule.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{schedule.exam_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{schedule.subject_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="font-medium text-gray-900">{schedule.date}</div>
                                                <div className="text-gray-400">{schedule.start_time} ({schedule.duration_minutes}m)</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="font-bold text-gray-900">{schedule.passing_marks}</span>
                                                <span className="text-gray-400">/{schedule.full_marks}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {schedules.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No exam slots scheduled.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <ExamModal
                isOpen={showExamModal}
                onClose={() => setShowExamModal(false)}
                onSuccess={fetchData}
            />
            <ExamScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
