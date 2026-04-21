import React, { useState, useEffect } from 'react';
import { X, BookOpen, GraduationCap, Clock, DollarSign } from 'lucide-react';
import type { Class, ClassFormData } from '../../services/classService';
import { schoolService } from '../../services/schoolService';
import { useInstitutionTerms } from '../../hooks/useInstitutionTerms';
import toast from 'react-hot-toast';

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ClassFormData) => Promise<void>;
    classData?: Class;
    isLoading?: boolean;
}

interface School {
    id: string;
    name: string;
}

export default function ClassModal({ isOpen, onClose, onSubmit, classData, isLoading }: ClassModalProps) {
    const terms = useInstitutionTerms();
    const [formData, setFormData] = useState<ClassFormData>({
        school: '',
        name: '',
        code: '',
        description: '',
        class_type: 'CLASS',
        duration_weeks: null,
        course_fee: null,
    });

    const [schools, setSchools] = useState<School[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchSchools();
            if (classData) {
                setFormData({
                    school: classData.school || '',
                    name: classData.name || '',
                    code: classData.code || '',
                    description: classData.description || '',
                    class_type: classData.class_type || 'CLASS',
                    duration_weeks: classData.duration_weeks || null,
                    course_fee: classData.course_fee || null,
                });
            } else {
                const defaultType = (window as any).__defaultClassType || terms.defaultClassType;
                setFormData({
                    school: '',
                    name: '',
                    code: '',
                    description: '',
                    class_type: defaultType,
                    duration_weeks: null,
                    course_fee: null,
                });
            }
        }
    }, [isOpen, classData, terms.defaultClassType]);

    const fetchSchools = async () => {
        try {
            const data = await schoolService.getAll();
            setSchools(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch schools');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
        }));
    };

    if (!isOpen) return null;

    const isCourse = formData.class_type === 'COURSE';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCourse ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            {isCourse ? <BookOpen className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {classData ? `Edit ${isCourse ? 'Course' : 'Class'}` : `Add New ${isCourse ? 'Course' : 'Class'}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                            {terms.institutionLabel} *
                        </label>
                        <select
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
                        >
                            <option value="">Select {terms.institutionLabel}</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Selector (Only if institution allows both) */}
                    {terms.canHaveCourses && !terms.usesCourses && !classData && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                Entry Type
                            </label>
                            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, class_type: 'CLASS' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.class_type === 'CLASS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    CLASS
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, class_type: 'COURSE' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.class_type === 'COURSE' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    COURSE
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                {isCourse ? 'Course Name' : 'Class Name'} *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder={isCourse ? 'e.g., Python Basics' : 'e.g., Class 10'}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                {isCourse ? 'Course Code' : 'Class Code'} *
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                placeholder="e.g., PY101, STD10"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {isCourse && (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                    Duration (Wks)
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="duration_weeks"
                                        value={formData.duration_weeks || ''}
                                        onChange={handleChange}
                                        placeholder="Weeks"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {isCourse && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                Course Fees (₹)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="course_fee"
                                    value={formData.course_fee || ''}
                                    onChange={handleChange}
                                    placeholder="Enter base fee amount"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Optional summary..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
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
                            className={`flex-1 py-3 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isCourse ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : classData ? 'Update' : 'Create Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
