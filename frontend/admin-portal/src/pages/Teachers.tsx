import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, X, UserCheck, UserX } from 'lucide-react';

import toast from 'react-hot-toast';

import { teacherService } from '../services/teacherService';

import type { Staff as Teacher, StaffFormData as TeacherFormData } from '../services/teacherService';
import TeacherModal from '../components/teachers/TeacherModal';

export default function Teachers() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>(undefined);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);


    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await teacherService.getAll({ search: searchQuery });
            setTeachers(data.results || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTeachers();
    };

    const handleCreate = () => {
        setSelectedTeacher(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await teacherService.delete(id);
                fetchTeachers();
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert('Failed to delete staff member');
            }
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await teacherService.toggleStatus(id);
            toast.success('Status updated');
            fetchTeachers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };


    const handleSubmit = async (data: TeacherFormData) => {
        try {
            setActionLoading(true);
            if (selectedTeacher) {
                await teacherService.update(selectedTeacher.id, data);
            } else {
                await teacherService.create(data);
            }
            setIsModalOpen(false);
            fetchTeachers();
        } catch (error: any) {
            console.error('Error saving staff:', error);
            const message = error.response?.data?.detail ||
                error.response?.data?.message ||
                Object.values(error.response?.data || {})[0] ||
                'Failed to save staff member';
            toast.error(typeof message === 'string' ? message : 'Failed to save staff member');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Upload className="-ml-1 mr-2 h-5 w-5" />
                        Import Staff
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Add Staff
                    </button>
                </div>
            </div>


            <div className="bg-white shadow rounded-lg">
                <div className="p-4 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Search staff members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Designation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No staff found
                                    </td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                                                        {teacher.user.first_name[0]}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {teacher.user.first_name} {teacher.user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{teacher.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {teacher.employee_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {teacher.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {teacher.designation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(teacher.id)}
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-all hover:scale-105 ${teacher.user.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                title={teacher.user.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {teacher.user.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(teacher)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(teacher.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <TeacherModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                teacher={selectedTeacher}
                isLoading={actionLoading}
            />

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Import Staff</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h4 className="text-sm font-bold text-indigo-800 mb-2">CSV Format Instructions</h4>
                                <p className="text-xs text-indigo-600 leading-relaxed">
                                    Your CSV file should have headers: <code className="bg-white px-1 rounded">first_name</code>, <code className="bg-white px-1 rounded">last_name</code>, <code className="bg-white px-1 rounded">employee_id</code>, <code className="bg-white px-1 rounded">department</code>, <code className="bg-white px-1 rounded">designation</code>.
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Select CSV File</label>
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                setActionLoading(true);
                                                const response = await teacherService.importTeachers(formData);
                                                toast.success(`Successfully imported ${response.success} staff members!`);
                                                setIsImportModalOpen(false);
                                                fetchTeachers();
                                            } catch (error: any) {
                                                const errorData = error.response?.data;
                                                toast.error(errorData?.error || 'Failed to import staff');
                                                if (errorData?.errors?.length > 0) {
                                                    console.error('Import errors:', errorData.errors);
                                                }
                                            } finally {
                                                setActionLoading(false);
                                            }
                                        }
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                />
                            </div>
                            
                            {actionLoading && (
                                <div className="flex items-center justify-center gap-3 text-indigo-600 font-bold animate-pulse">
                                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    Importing data...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
