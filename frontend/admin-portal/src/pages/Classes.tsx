import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { classService, type Class, type ClassFormData, type Section, type SectionFormData } from '../services/classService';
import ClassModal from '../components/classes/ClassModal';
import SectionModal from '../components/classes/SectionModal';
import { authStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Classes() {
    const { user } = authStore();
    const currentSchoolId = typeof user?.school === 'string' ? user?.school : user?.school?.id;
    const currentSchool = user?.allowed_schools?.find((s: any) => s.id === currentSchoolId);
    const isTrainingCenter = currentSchool?.institution_type === 'TRAINING_CENTER';

    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | undefined>(undefined);
    const [selectedSection, setSelectedSection] = useState<Section | undefined>(undefined);
    const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState(false);
    const [currentClassForSection, setCurrentClassForSection] = useState<string>('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await classService.getClasses({ search: searchQuery });
            setClasses(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch classes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchClasses();
    };

    const handleCreateClass = () => {
        setSelectedClass(undefined);
        setIsClassModalOpen(true);
    };

    const handleEditClass = (classData: Class) => {
        setSelectedClass(classData);
        setIsClassModalOpen(true);
    };

    const handleDeleteClass = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this class? This will also delete all sections.')) {
            try {
                await classService.deleteClass(id);
                toast.success('Class deleted successfully');
                fetchClasses();
            } catch (error) {
                toast.error('Failed to delete class');
                console.error(error);
            }
        }
    };

    const handleSubmitClass = async (data: ClassFormData) => {
        try {
            setActionLoading(true);
            if (selectedClass) {
                await classService.updateClass(selectedClass.id, data);
                toast.success('Class updated successfully');
            } else {
                await classService.createClass(data);
                toast.success('Class created successfully');
            }
            setIsClassModalOpen(false);
            fetchClasses();
        } catch (error) {
            toast.error('Failed to save class');
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateSection = (classId: string) => {
        setCurrentClassForSection(classId);
        setSelectedSection(undefined);
        setIsSectionModalOpen(true);
    };

    const handleEditSection = (section: Section, classId: string) => {
        setCurrentClassForSection(classId);
        setSelectedSection(section);
        setIsSectionModalOpen(true);
    };

    const handleDeleteSection = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            try {
                await classService.deleteSection(id);
                toast.success('Section deleted successfully');
                fetchClasses();
            } catch (error) {
                toast.error('Failed to delete section');
                console.error(error);
            }
        }
    };

    const handleSubmitSection = async (data: SectionFormData) => {
        try {
            setActionLoading(true);
            if (selectedSection) {
                await classService.updateSection(selectedSection.id, data);
                toast.success('Section updated successfully');
            } else {
                await classService.createSection(data);
                toast.success('Section created successfully');
            }
            setIsSectionModalOpen(false);
            fetchClasses();
        } catch (error) {
            toast.error('Failed to save section');
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleClassExpansion = (classId: string) => {
        setExpandedClasses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(classId)) {
                newSet.delete(classId);
            } else {
                newSet.add(classId);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{isTrainingCenter ? 'Courses & Batches' : 'Classes & Sections'}</h1>
                <button
                    onClick={handleCreateClass}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    {isTrainingCenter ? 'Add Course' : 'Add Class'}
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
                                placeholder={`Search ${isTrainingCenter ? 'courses' : 'classes'}...`}
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
                    ) : classes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No classes found
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {classes.map((classData) => (
                                <div key={classData.id}>
                                    {/* Class Row */}
                                    <div className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center flex-1">
                                                <button
                                                    onClick={() => toggleClassExpansion(classData.id)}
                                                    className="mr-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {expandedClasses.has(classData.id) ? (
                                                        <ChevronDown className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-indigo-600 font-bold text-lg">
                                                                {classData.code}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {classData.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {classData.sections?.length || 0} {isTrainingCenter ? 'batch(es)' : 'section(s)'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCreateSection(classData.id)}
                                                    className="inline-flex items-center px-3 py-1 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    {isTrainingCenter ? 'Add Batch' : 'Add Section'}
                                                </button>
                                                <button
                                                    onClick={() => handleEditClass(classData)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(classData.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sections (Expanded) */}
                                    {expandedClasses.has(classData.id) && (
                                        <div className="bg-gray-50 px-6 py-4">
                                            {classData.sections && classData.sections.length > 0 ? (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-3">{isTrainingCenter ? 'Batches:' : 'Sections:'}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {classData.sections.map((section) => (
                                                            <div
                                                                key={section.id}
                                                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center">
                                                                            <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                                                <span className="text-purple-600 font-bold">
                                                                                    {section.name}
                                                                                </span>
                                                                            </div>
                                                                            <div className="ml-3">
                                                                                <div className="text-sm font-medium text-gray-900">
                                                                                    {isTrainingCenter ? 'Batch' : 'Section'} {section.name}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                    <Users className="inline h-3 w-3 mr-1" />
                                                                                    Capacity: {section.capacity}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {section.room_number && (
                                                                            <div className="mt-2 text-xs text-gray-600">
                                                                                Room: {section.room_number}
                                                                            </div>
                                                                        )}
                                                                        {section.class_teacher_details && (
                                                                            <div className="mt-1 text-xs text-gray-600">
                                                                                Teacher: {section.class_teacher_details.user.first_name}{' '}
                                                                                {section.class_teacher_details.user.last_name}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => handleEditSection(section, classData.id)}
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            <Edit2 className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteSection(section.id)}
                                                                            className="text-red-600 hover:text-red-900"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    {isTrainingCenter ? 'No batches yet. Click "Add Batch" to create one.' : 'No sections yet. Click "Add Section" to create one.'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ClassModal
                isOpen={isClassModalOpen}
                onClose={() => {
                    setIsClassModalOpen(false);
                    setSelectedClass(undefined);
                }}
                onSubmit={handleSubmitClass}
                classData={selectedClass}
                isLoading={actionLoading}
            />

            <SectionModal
                isOpen={isSectionModalOpen}
                onClose={() => {
                    setIsSectionModalOpen(false);
                    setSelectedSection(undefined);
                }}
                onSubmit={handleSubmitSection}
                section={selectedSection}
                classId={currentClassForSection}
                isLoading={actionLoading}
            />
        </div>
    );
}
