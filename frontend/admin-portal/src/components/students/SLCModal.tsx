import React, { useState, useEffect } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { studentService, type Student } from '../../services/studentService';
import { schoolService } from '../../services/schoolService';
import toast from 'react-hot-toast';

interface SLCModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    onSuccess: () => void;
}

const SLCModal: React.FC<SLCModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        exit_session: '',
        date_of_issue: new Date().toISOString().split('T')[0],
        reason_for_leaving: '',
        conduct_character: 'Good',
        academic_performance: 'Satisfactory',
        remarks: ''
    });

    useEffect(() => {
        if (isOpen && student) {
            fetchSessions();
        }
    }, [isOpen, student]);

    const fetchSessions = async () => {
        if (!student) return;
        try {
            const data = await schoolService.getAcademicYears(student.school);
            setSessions(data.results || data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        try {
            setLoading(true);
            await studentService.generateSLC({
                student: student.id,
                exit_session: formData.exit_session,
                date_of_issue: formData.date_of_issue,
                reason_for_leaving: formData.reason_for_leaving,
                conduct_character: formData.conduct_character,
                academic_performance: formData.academic_performance,
                remarks: formData.remarks
            });
            toast.success('SLC generated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('SLC generation error:', error);
            toast.error('Failed to generate SLC');
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
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-600 text-white">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Generate Leaving Certificate (SLC)
                        </h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4 text-red-800 text-sm">
                            <strong>Warning:</strong> Generating an SLC will mark the student as <strong>LEFT</strong> and they will no longer appear in active class lists.
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Exit Session *</label>
                            <select 
                                required
                                value={formData.exit_session}
                                onChange={(e) => setFormData({...formData, exit_session: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Date of Issue *</label>
                            <input 
                                type="date"
                                required
                                value={formData.date_of_issue}
                                onChange={(e) => setFormData({...formData, date_of_issue: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Reason for Leaving *</label>
                            <input 
                                type="text"
                                required
                                value={formData.reason_for_leaving}
                                onChange={(e) => setFormData({...formData, reason_for_leaving: e.target.value})}
                                placeholder="e.g. Completed Education, Relocation"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Conduct</label>
                                <input 
                                    type="text"
                                    value={formData.conduct_character}
                                    onChange={(e) => setFormData({...formData, conduct_character: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Performance</label>
                                <input 
                                    type="text"
                                    value={formData.academic_performance}
                                    onChange={(e) => setFormData({...formData, academic_performance: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Remarks</label>
                            <textarea 
                                value={formData.remarks}
                                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none h-20"
                                placeholder="Any additional notes for the certificate..."
                            />
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
                                className="flex-2 px-10 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Generating...' : <><Download className="w-4 h-4" /> Generate SLC</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SLCModal;
