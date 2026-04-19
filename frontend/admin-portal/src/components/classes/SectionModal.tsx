import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Section, SectionFormData } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
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
                resetForm();
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

    const resetForm = () => {
        setFormData({
            class_group: classId,
            name: '',
            class_teacher: '',
            room_number: '',
            capacity: 40,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Convert empty string to null for optional foreign key fields
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {section ? 'Edit Section' : 'Add New Section'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., A, B, C"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class Teacher
                        </label>
                        <select
                            name="class_teacher"
                            value={formData.class_teacher}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Teacher (Optional)</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.user.first_name} {teacher.user.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Number
                        </label>
                        <input
                            type="text"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            placeholder="e.g., 101, A-205"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity *
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : section ? 'Update Section' : 'Create Section'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
