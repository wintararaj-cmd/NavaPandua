import React, { useState, useEffect } from 'react';
import { X, GraduationCap, ArrowRight } from 'lucide-react';
import { studentService, type Student } from '../../services/studentService';
import { classService, type Class, type Section } from '../../services/classService';
import { schoolService } from '../../services/schoolService';
import toast from 'react-hot-toast';

interface PromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    onSuccess: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        new_class: '',
        new_section: '',
        new_session: '',
        remarks: ''
    });

    useEffect(() => {
        if (isOpen && student) {
            fetchInitialData();
        }
    }, [isOpen, student]);

    const fetchInitialData = async () => {
        if (!student) return;
        try {
            const [classesData, sessionsData] = await Promise.all([
                classService.getClasses(student.school),
                schoolService.getAcademicYears(student.school)
            ]);
            setClasses(classesData.results || classesData);
            setSessions(sessionsData.results || sessionsData);
        } catch (error) {
            console.error('Error fetching promotion data:', error);
            toast.error('Failed to load classes or sessions');
        }
    };

    useEffect(() => {
        if (formData.new_class) {
            fetchSections(formData.new_class);
        }
    }, [formData.new_class]);

    const fetchSections = async (classId: string) => {
        try {
            const data = await classService.getSections(classId);
            setSections(data.results || data);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        try {
            setLoading(true);
            await studentService.promoteStudent({
                student: student.id,
                previous_class: student.current_class,
                new_class: formData.new_class,
                previous_session: student.school_details?.current_academic_year || '', // Ideally from student data
                new_session: formData.new_session,
                remarks: formData.remarks
            });
            toast.success('Student promoted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Promotion error:', error);
            toast.error('Failed to promote student');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={onClose} />
                
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-600">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" /> Promote Student
                        </h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
                            <div>
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Current Class</div>
                                <div className="font-bold text-indigo-900">{student.class_details?.name || 'N/A'}</div>
                            </div>
                            <ArrowRight className="text-indigo-300" />
                            <div className="text-right">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Target Class</div>
                                <div className="font-bold text-indigo-900">
                                    {classes.find(c => c.id === formData.new_class)?.name || 'Select below'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">New Class *</label>
                                <select 
                                    required
                                    value={formData.new_class}
                                    onChange={(e) => setFormData({...formData, new_class: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">New Section *</label>
                                <select 
                                    required
                                    value={formData.new_section}
                                    onChange={(e) => setFormData({...formData, new_section: e.target.value})}
                                    disabled={!formData.new_class}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">New Academic Session *</label>
                                <select 
                                    required
                                    value={formData.new_session}
                                    onChange={(e) => setFormData({...formData, new_session: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Remarks</label>
                                <textarea 
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                                    placeholder="Optional notes about this promotion..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm Promotion'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
