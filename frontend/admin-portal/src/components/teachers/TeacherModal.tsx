import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Teacher, TeacherFormData } from '../../services/teacherService';

interface TeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TeacherFormData) => Promise<void>;
    teacher?: Teacher;
    isLoading?: boolean;
}

const TeacherModal: React.FC<TeacherModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    teacher,
    isLoading
}) => {
    const [formData, setFormData] = useState<TeacherFormData>({
        user: {
            email: '',
            first_name: '',
            last_name: '',
            phone: '',
            password: '',
            gender: '',
            date_of_birth: ''
        },
        employee_id: '',
        department: '',
        designation: '',
        qualification: '',
        joining_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (teacher) {
            setFormData({
                user: {
                    email: teacher.user.email,
                    first_name: teacher.user.first_name,
                    last_name: teacher.user.last_name,
                    phone: teacher.user.phone,
                    gender: teacher.user.gender,
                    date_of_birth: teacher.user.date_of_birth || ''
                },
                employee_id: teacher.employee_id,
                department: teacher.department,
                designation: teacher.designation,
                qualification: teacher.qualification,
                joining_date: teacher.joining_date
            });
        } else {
            setFormData({
                user: {
                    email: '',
                    first_name: '',
                    last_name: '',
                    phone: '',
                    password: 'teacher123', // Default password suggestion
                    gender: 'MALE',
                    date_of_birth: ''
                },
                employee_id: '',
                department: '',
                designation: '',
                qualification: '',
                joining_date: new Date().toISOString().split('T')[0]
            });
        }
    }, [teacher, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [name]: value
            }
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    {teacher ? 'Edit Teacher' : 'Add New Teacher'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-sm font-medium text-gray-500 border-b pb-2 mb-4">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.user.first_name}
                                                onChange={handleUserChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.user.last_name}
                                                onChange={handleUserChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.user.gender}
                                                onChange={handleUserChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.user.email}
                                                onChange={handleUserChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.user.phone}
                                                onChange={handleUserChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.user.date_of_birth}
                                                onChange={handleUserChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        {!teacher && (
                                            <div className="col-span-1 md:col-span-3">
                                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.user.password}
                                                    onChange={handleUserChange}
                                                    placeholder="Leave empty for default (teacher123)"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Default is teacher123</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-sm font-medium text-gray-500 border-b pb-2 mb-4 mt-2">Professional Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                            <input
                                                type="text"
                                                name="employee_id"
                                                value={formData.employee_id}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                            <input
                                                type="date"
                                                name="joining_date"
                                                value={formData.joining_date}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Designation</label>
                                            <input
                                                type="text"
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Qualification</label>
                                            <input
                                                type="text"
                                                name="qualification"
                                                value={formData.qualification}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Teacher
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeacherModal;
