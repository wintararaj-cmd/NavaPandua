
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { examService, type Exam } from '../../services/examService';
import { subjectService, type Subject } from '../../services/subjectService';
import toast from 'react-hot-toast';

interface ExamScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ExamScheduleModal({ isOpen, onClose, onSuccess }: ExamScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState<Exam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [formData, setFormData] = useState({
        exam: '',
        subject: '',
        date: '',
        start_time: '',
        duration_minutes: '180',
        room_number: '',
        full_marks: '100',
        passing_marks: '33'
    });

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen]);

    const fetchDependencies = async () => {
        try {
            const [examsData, subjectsData] = await Promise.all([
                examService.getExams(),
                subjectService.getSubjects()
            ]);
            setExams(examsData.results || []);
            setSubjects(subjectsData.results || []);
        } catch (error) {
            toast.error('Failed to load exams or subjects');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await examService.createSchedule({
                ...formData,
                duration_minutes: parseInt(formData.duration_minutes),
                full_marks: parseFloat(formData.full_marks),
                passing_marks: parseFloat(formData.passing_marks)
            });
            toast.success('Exam schedule added');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error('Failed to add schedule');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                <div className="relative bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Add Exam Slot</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.exam}
                                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                                >
                                    <option value="">Select Exam</option>
                                    {exams.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Marks</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.full_marks}
                                    onChange={(e) => setFormData({ ...formData, full_marks: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                    value={formData.passing_marks}
                                    onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="e.g. Hall A, Room 102"
                                value={formData.room_number}
                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border rounded-md">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 font-bold">
                                {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-4 w-4" />}
                                Schedule Exam
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
