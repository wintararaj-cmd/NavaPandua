import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';
import { subjectService, type Subject, type SubjectFormData } from '../services/subjectService';
import SubjectModal from '../components/subjects/SubjectModal';
import toast from 'react-hot-toast';

export default function Subjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(undefined);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await subjectService.getSubjects({ search: searchQuery });
            setSubjects(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch subjects');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSubjects();
    };

    const handleCreate = () => {
        setSelectedSubject(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await subjectService.deleteSubject(id);
                toast.success('Subject deleted successfully');
                fetchSubjects();
            } catch (error) {
                toast.error('Failed to delete subject');
                console.error(error);
            }
        }
    };

    const handleSubmit = async (data: SubjectFormData) => {
        try {
            setActionLoading(true);
            if (selectedSubject) {
                await subjectService.updateSubject(selectedSubject.id, data);
                toast.success('Subject updated successfully');
            } else {
                await subjectService.createSubject(data);
                toast.success('Subject created successfully');
            }
            setIsModalOpen(false);
            fetchSubjects();
        } catch (error) {
            toast.error('Failed to save subject');
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const getSubjectTypeColor = (type: string) => {
        switch (type) {
            case 'THEORY':
                return 'bg-blue-100 text-blue-800';
            case 'PRACTICAL':
                return 'bg-green-100 text-green-800';
            case 'BOTH':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSubjectTypeLabel = (type: string) => {
        switch (type) {
            case 'THEORY':
                return 'Theory';
            case 'PRACTICAL':
                return 'Practical';
            case 'BOTH':
                return 'Theory & Practical';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Subject
                </button>
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
                                placeholder="Search subjects..."
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
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No subjects found
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <tr key={subject.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <BookOpen className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subject.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {subject.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubjectTypeColor(
                                                    subject.subject_type
                                                )}`}
                                            >
                                                {getSubjectTypeLabel(subject.subject_type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {subject.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <SubjectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSubject(undefined);
                }}
                onSubmit={handleSubmit}
                subject={selectedSubject}
                isLoading={actionLoading}
            />
        </div>
    );
}
