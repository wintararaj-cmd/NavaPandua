import React, { useState, useEffect } from 'react';
import { X, Send, Users, User, GraduationCap, Calendar, ToggleLeft, FileText } from 'lucide-react';
import { classService, type Class } from '../../services/classService';
import type { Announcement, AnnouncementFormData } from '../../services/notificationService';
import toast from 'react-hot-toast';

interface AnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AnnouncementFormData) => Promise<void>;
    announcement?: Announcement;
    isLoading?: boolean;
}

export default function AnnouncementModal({ isOpen, onClose, onSubmit, announcement, isLoading }: AnnouncementModalProps) {
    const [formData, setFormData] = useState<AnnouncementFormData>({
        title: '',
        content: '',
        target_audience: 'ALL',
        target_class: '',
        expiry_date: '',
        is_active: true
    });

    const [classes, setClasses] = useState<Class[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchClasses();
            if (announcement) {
                setFormData({
                    title: announcement.title || '',
                    content: announcement.content || '',
                    target_audience: announcement.target_audience || 'ALL',
                    target_class: announcement.target_class || '',
                    expiry_date: announcement.expiry_date || '',
                    is_active: announcement.is_active ?? true
                });
            } else {
                setFormData({
                    title: '',
                    content: '',
                    target_audience: 'ALL',
                    target_class: '',
                    expiry_date: '',
                    is_active: true
                });
            }
        }
    }, [isOpen, announcement]);

    const fetchClasses = async () => {
        try {
            const data = await classService.getClasses();
            setClasses(data.results || []);
        } catch (error) {
            console.error('Failed to fetch classes');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            target_class: formData.target_audience === 'CLASS' ? formData.target_class : null,
            expiry_date: formData.expiry_date || null
        };
        await onSubmit(submitData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                {announcement ? 'Edit Announcement' : 'Post New Notice'}
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Official Circular</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Subject / Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Annual Sports Day 2024"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Announcement Content *</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Write the details of your announcement here..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Target Audience *</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'ALL', label: 'Everyone', icon: Users },
                                    { id: 'TEACHERS', label: 'Teachers', icon: User },
                                    { id: 'STUDENTS', label: 'Students', icon: GraduationCap },
                                    { id: 'CLASS', label: 'Specific Class', icon: FileText },
                                ].map(audience => (
                                    <button
                                        key={audience.id}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, target_audience: audience.id as any }))}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
                                            formData.target_audience === audience.id
                                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                        }`}
                                    >
                                        <audience.icon className={`w-5 h-5 ${formData.target_audience === audience.id ? 'text-indigo-600' : 'text-gray-300'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-tight leading-none">{audience.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {formData.target_audience === 'CLASS' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Select Target Class *</label>
                                    <select
                                        name="target_class"
                                        value={formData.target_class || ''}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    >
                                        <option value="">Choose Class</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={formData.expiry_date || ''}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Display this announcement immediately</label>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-2 px-10 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (
                                <>
                                    <Send className="w-4 h-4" />
                                    {announcement ? 'Update Notice' : 'Post Announcement'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
