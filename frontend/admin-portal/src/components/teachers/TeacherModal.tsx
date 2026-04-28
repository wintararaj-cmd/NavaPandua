import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Staff as Teacher, StaffFormData as TeacherFormData } from '../../services/teacherService';

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
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        gender: 'MALE',
        date_of_birth: '',
        role: 'TEACHER',
        employee_id: '',
        department: '',
        designation: '',
        qualification: '',
        joining_date: new Date().toISOString().split('T')[0],
        current_address: '',
        basic_salary: 0,
        bank_account_no: '',
        ifsc_code: '',
        bank_name: ''
    });

    useEffect(() => {
        if (teacher) {
            setFormData({
                email: teacher.user.email,
                first_name: teacher.user.first_name,
                last_name: teacher.user.last_name,
                phone: teacher.user.phone,
                gender: teacher.user.gender || 'MALE',
                date_of_birth: teacher.user.date_of_birth || '',
                role: teacher.user.role || 'TEACHER',
                employee_id: teacher.employee_id,
                department: teacher.department,
                designation: teacher.designation,
                qualification: teacher.qualification,
                joining_date: teacher.joining_date,
                current_address: teacher.current_address || '',
                basic_salary: teacher.basic_salary || 0,
                bank_account_no: teacher.bank_account_no || '',
                ifsc_code: teacher.ifsc_code || '',
                bank_name: teacher.bank_name || ''
            });
        } else {
            setFormData({
                email: '',
                first_name: '',
                last_name: '',
                phone: '',
                password: 'staff123',
                gender: 'MALE',
                date_of_birth: '',
                role: 'TEACHER',
                employee_id: '',
                department: '',
                designation: '',
                qualification: '',
                joining_date: new Date().toISOString().split('T')[0],
                current_address: '',
                basic_salary: 0,
                bank_account_no: '',
                ifsc_code: '',
                bank_name: ''
            });
        }
    }, [teacher, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basic_salary' ? parseFloat(value) || 0 : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    {teacher ? 'Edit Staff Member' : 'Add New Staff Member'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500"
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
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Staff Role</label>
                                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm font-bold text-indigo-600">
                                                <option value="TEACHER">Teacher</option>
                                                <option value="ACCOUNTANT">Accountant</option>
                                                <option value="LIBRARIAN">Librarian</option>
                                                <option value="HR">HR Manager</option>
                                                <option value="TRANSPORT_MANAGER">Transport Manager</option>
                                                <option value="DRIVER">Driver</option>
                                                <option value="SCHOOL_ADMIN">School Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-sm font-medium text-gray-500 border-b pb-2 mb-4 mt-2">Professional Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                            <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                            <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department</label>
                                            <input type="text" name="department" value={formData.department} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Designation</label>
                                            <input type="text" name="designation" value={formData.designation} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Salary & Bank Information */}
                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-sm font-medium text-gray-500 border-b pb-2 mb-4 mt-2">Salary & Bank Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                                            <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                            <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                            <input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                        <div className="col-span-1 md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700">Current Address</label>
                                            <input type="text" name="current_address" value={formData.current_address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Staff Member</>}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
