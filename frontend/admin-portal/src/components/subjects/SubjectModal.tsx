import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Subject, SubjectFormData } from '../../services/subjectService';
import { schoolService } from '../../services/schoolService';
import toast from 'react-hot-toast';

interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SubjectFormData) => Promise<void>;
    subject?: Subject;
    isLoading?: boolean;
}

interface School {
    id: string;
    name: string;
}

export default function SubjectModal({ isOpen, onClose, onSubmit, subject, isLoading }: SubjectModalProps) {
    const [formData, setFormData] = useState<SubjectFormData>({
        school: '',
        name: '',
        code: '',
        description: '',
        subject_type: 'THEORY',
    });

    const [schools, setSchools] = useState<School[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchSchools();
            if (subject) {
                setFormData({
                    school: subject.school || '',
                    name: subject.name || '',
                    code: subject.code || '',
                    description: subject.description || '',
                    subject_type: subject.subject_type || 'THEORY',
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, subject]);

    const fetchSchools = async () => {
        try {
            const data = await schoolService.getAll();
            setSchools(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch schools');
        }
    };

    const resetForm = () => {
        setFormData({
            school: '',
            name: '',
            code: '',
            description: '',
            subject_type: 'THEORY',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {subject ? 'Edit Subject' : 'Add New Subject'}
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
                            School *
                        </label>
                        <select
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select School</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Mathematics, Physics"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Code *
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="e.g., MATH101, PHY101"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Type *
                        </label>
                        <select
                            name="subject_type"
                            value={formData.subject_type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="THEORY">Theory</option>
                            <option value="PRACTICAL">Practical</option>
                            <option value="BOTH">Both (Theory & Practical)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Optional description..."
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
                            {isLoading ? 'Saving...' : subject ? 'Update Subject' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
