
import React, { useState, useEffect } from 'react';
import { X, GraduationCap, ArrowRight, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { classService, type Class, type Section } from '../../services/classService';
import { schoolService, type AcademicYear } from '../../services/schoolService';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    students: any[];
    currentClassId: string;
    currentClassName: string;
}

export default function PromotionModal({ isOpen, onClose, onSuccess, students, currentClassId, currentClassName }: Props) {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    const [formData, setFormData] = useState({
        to_class: '',
        to_section: '',
        to_session: '',
        from_session: '',
        status: 'PROMOTED'
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [cRes, yRes] = await Promise.all([
                classService.getClasses(),
                schoolService.getAcademicYears()
            ]);
            setClasses(cRes.results || []);
            setAcademicYears(yRes.results || []);
            
            // Auto-select current session for 'from_session'
            const activeYear = yRes.results?.find((y: any) => y.is_active);
            if (activeYear) {
                setFormData(prev => ({ ...prev, from_session: activeYear.id }));
            }
        } catch { toast.error('Failed to load setup data'); }
    };

    const handleClassChange = async (classId: string) => {
        setFormData(prev => ({ ...prev, to_class: classId, to_section: '' }));
        if (classId) {
            try {
                const res = await classService.getSections(classId);
                setSections(res.results || []);
            } catch { toast.error('Failed to load sections'); }
        } else {
            setSections([]);
        }
    };

    const handlePromote = async () => {
        if (!formData.to_class || !formData.to_session || !formData.from_session) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            await studentService.bulkPromote({
                students: students.map(s => s.id),
                ...formData
            });
            toast.success(`Successfully promoted ${students.length} students`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Promotion failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-indigo-50/30">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> End of Session
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Bulk Promotion <GraduationCap className="w-8 h-8 text-indigo-600" />
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all hover:shadow-lg active:scale-95 group">
                        <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex items-center gap-6 p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
                        <div className="flex-1 text-center">
                            <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Current Class</div>
                            <div className="text-xl font-black">{currentClassName}</div>
                        </div>
                        <ArrowRight className="w-8 h-8 text-white/50" />
                        <div className="flex-1 text-center">
                            <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Targeting</div>
                            <div className="text-xl font-black">{classes.find(c => c.id === formData.to_class)?.name || 'Next Class'}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Current Session</label>
                            <select 
                                value={formData.from_session}
                                onChange={(e) => setFormData({ ...formData, from_session: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            >
                                <option value="">Choose Session</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Promote To Session</label>
                            <select 
                                value={formData.to_session}
                                onChange={(e) => setFormData({ ...formData, to_session: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            >
                                <option value="">Choose Session</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Promote To Class</label>
                            <select 
                                value={formData.to_class}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            >
                                <option value="">Choose Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Section (Optional)</label>
                            <select 
                                value={formData.to_section}
                                onChange={(e) => setFormData({ ...formData, to_section: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                            >
                                <option value="">Any Section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            <strong>Note:</strong> Promoting students will update their active class/session. All academic records from the current session will be preserved in their history. Ensure that the target academic session is open for enrollment.
                        </p>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-sm text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest">
                        Cancel
                    </button>
                    <button 
                        onClick={handlePromote}
                        disabled={loading || !formData.to_class}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                    >
                        {loading ? 'Processing...' : <><GraduationCap className="w-5 h-5" /> Execute Promotion</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
