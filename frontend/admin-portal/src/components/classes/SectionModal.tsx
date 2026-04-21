import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, UserCheck } from 'lucide-react';
import type { Section, SectionFormData } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { useInstitutionTerms } from '../../hooks/useInstitutionTerms';
import toast from 'react-hot-toast';

interface SectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SectionFormData) => Promise<void>;
    section?: Section;
    classId: string;
    isLoading?: boolean;
}

interface Teacher {
    id: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export default function SectionModal({ isOpen, onClose, onSubmit, section, classId, isLoading }: SectionModalProps) {
    const terms = useInstitutionTerms();
    const [formData, setFormData] = useState<SectionFormData>({
        class_group: classId,
        name: '',
        class_teacher: '',
        room_number: '',
        capacity: 40,
    });

    const [teachers, setTeachers] = useState<Teacher[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
            if (section) {
                setFormData({
                    class_group: section.class_group || classId,
                    name: section.name || '',
                    class_teacher: section.class_teacher || '',
                    room_number: section.room_number || '',
                    capacity: section.capacity || 40,
                });
            } else {
                setFormData({
                    class_group: classId,
                    name: '',
                    class_teacher: '',
                    room_number: '',
                    capacity: 40,
                });
            }
        }
    }, [isOpen, section, classId]);

    const fetchTeachers = async () => {
        try {
            const data = await teacherService.getAll();
            setTeachers(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch teachers');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            class_teacher: formData.class_teacher || null,
        };
        await onSubmit(submitData as SectionFormData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Users className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {section ? `Edit ${terms.sectionLabel}` : `Add New ${terms.sectionLabel}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                            {terms.sectionLabel} Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder={terms.sectionLabel === 'Batch' ? 'e.g., Batch 1, Evening' : 'e.g., A, B, C'}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                            {terms.institutionType === 'K12_SCHOOL' ? 'Class Teacher' : 'Instructor'}
                        </label>
                        <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                name="class_teacher"
                                value={formData.class_teacher}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select (Optional)</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.user.first_name} {teacher.user.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                Room/Lab
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="room_number"
                                    value={formData.room_number}
                                    onChange={handleChange}
                                    placeholder="e.g., 101, Lab A"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                Capacity *
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="500"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-indigo-600 border border-transparent rounded-xl text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : section ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
