import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, Users, BookOpen, GraduationCap, Clock, DollarSign } from 'lucide-react';
import { classService, type Class, type ClassFormData, type Section, type SectionFormData } from '../services/classService';
import ClassModal from '../components/classes/ClassModal';
import SectionModal from '../components/classes/SectionModal';
import { useInstitutionTerms } from '../hooks/useInstitutionTerms';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   Type Badge
───────────────────────────────────────────────────────── */
function TypeBadge({ classType }: { classType: 'CLASS' | 'COURSE' }) {
    return classType === 'COURSE'
        ? <span className="px-2 py-0.5 text-[10px] font-black bg-purple-100 text-purple-700 rounded-full uppercase">Course</span>
        : <span className="px-2 py-0.5 text-[10px] font-black bg-indigo-100 text-indigo-700 rounded-full uppercase">Class</span>;
}

export default function Classes() {
    const terms = useInstitutionTerms();

    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    // For K12 schools, filter toggle between all / only-classes / only-courses
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'CLASS' | 'COURSE'>('ALL');

    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | undefined>(undefined);
    const [selectedSection, setSelectedSection] = useState<Section | undefined>(undefined);
    const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
    const [actionLoading, setActionLoading] = useState(false);
    const [currentClassForSection, setCurrentClassForSection] = useState<string>('');

    useEffect(() => { fetchClasses(); }, [typeFilter]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const params: any = { search: searchQuery };
            if (typeFilter !== 'ALL') params.class_type = typeFilter;
            const data = await classService.getClasses(params);
            setClasses(Array.isArray(data) ? data : data.results || []);
        } catch {
            toast.error('Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = (forceType?: 'CLASS' | 'COURSE') => {
        setSelectedClass(undefined);
        // Inject a hint for the modal about the default class_type
        if (forceType) {
            (window as any).__defaultClassType = forceType;
        } else {
            (window as any).__defaultClassType = terms.defaultClassType;
        }
        setIsClassModalOpen(true);
    };

    const handleEditClass = (classData: Class) => { setSelectedClass(classData); setIsClassModalOpen(true); };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('Delete this item and all its sections/batches?')) return;
        try {
            await classService.deleteClass(id);
            toast.success('Deleted');
            fetchClasses();
        } catch { toast.error('Failed to delete'); }
    };

    const handleSubmitClass = async (data: ClassFormData) => {
        try {
            setActionLoading(true);
            if (selectedClass) {
                await classService.updateClass(selectedClass.id, data);
                toast.success(`${selectedClass.class_type === 'COURSE' ? 'Course' : 'Class'} updated`);
            } else {
                await classService.createClass({ ...data, class_type: (window as any).__defaultClassType ?? terms.defaultClassType });
                toast.success('Created successfully');
            }
            setIsClassModalOpen(false);
            fetchClasses();
        } catch { toast.error('Failed to save'); }
        finally { setActionLoading(false); }
    };

    const handleCreateSection = (classId: string) => { setCurrentClassForSection(classId); setSelectedSection(undefined); setIsSectionModalOpen(true); };
    const handleEditSection = (section: Section, classId: string) => { setCurrentClassForSection(classId); setSelectedSection(section); setIsSectionModalOpen(true); };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Delete this section/batch?')) return;
        try { await classService.deleteSection(id); toast.success('Deleted'); fetchClasses(); }
        catch { toast.error('Failed to delete'); }
    };

    const handleSubmitSection = async (data: SectionFormData) => {
        try {
            setActionLoading(true);
            if (selectedSection) {
                await classService.updateSection(selectedSection.id, data);
                toast.success('Updated');
            } else {
                await classService.createSection(data);
                toast.success('Created');
            }
            setIsSectionModalOpen(false);
            fetchClasses();
        } catch { toast.error('Failed to save'); }
        finally { setActionLoading(false); }
    };

    const toggleExpand = (id: string) => setExpandedClasses(prev => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
    });

    // For schools that can have both classes and courses, show tabs
    const showTypeTabs = !terms.usesCourses && terms.canHaveCourses;

    const sectionLabel = (cls: Class) => cls.class_type === 'COURSE' ? terms.sectionLabel : 'Section';
    const sectionsLabel = (cls: Class) => cls.class_type === 'COURSE' ? terms.sectionsLabel : 'Sections';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {showTypeTabs
                            ? typeFilter === 'COURSE' ? 'Courses' : typeFilter === 'CLASS' ? 'Classes' : 'Classes & Courses'
                            : terms.classesLabel + (terms.usesCourses ? '' : ' & ' + terms.sectionsLabel)}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {terms.institutionLabel} — Manage {terms.usesCourses ? 'courses' : 'classes'}{terms.canHaveCourses && !terms.usesCourses ? ' and courses' : ''}
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {showTypeTabs && (
                        <>
                            <button
                                onClick={() => handleCreateClass('CLASS')}
                                className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-50 transition"
                            >
                                <GraduationCap className="w-4 h-4" /> Add Class
                            </button>
                            <button
                                onClick={() => handleCreateClass('COURSE')}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 shadow-sm transition"
                            >
                                <BookOpen className="w-4 h-4" /> Add Course
                            </button>
                        </>
                    )}
                    {!showTypeTabs && (
                        <button
                            onClick={() => handleCreateClass()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md transition"
                        >
                            <Plus className="w-4 h-4" /> {terms.addClassLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                        placeholder={`Search ${terms.classesLabel.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchClasses()}
                    />
                </div>

                {showTypeTabs && (
                    <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
                        {[
                            { id: 'ALL', label: 'All' },
                            { id: 'CLASS', label: 'Classes' },
                            { id: 'COURSE', label: 'Courses' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setTypeFilter(f.id as any)}
                                className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${typeFilter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Class List */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="py-16 flex justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : classes.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                        <GraduationCap className="w-16 h-16 text-gray-100 mx-auto" />
                        <p className="text-gray-500 font-medium">No {terms.classesLabel.toLowerCase()} found</p>
                        <button onClick={() => handleCreateClass()} className="text-indigo-600 text-sm font-bold hover:underline">
                            + {terms.addClassLabel}
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {classes.map(cls => (
                            <div key={cls.id}>
                                {/* Class Row */}
                                <div className="px-6 py-4 hover:bg-gray-50 transition group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1 gap-3">
                                            <button onClick={() => toggleExpand(cls.id)} className="text-gray-300 hover:text-gray-500 transition">
                                                {expandedClasses.has(cls.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                            </button>

                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                                {cls.class_type === 'COURSE'
                                                    ? <BookOpen className="w-6 h-6 text-purple-600" />
                                                    : <GraduationCap className="w-6 h-6 text-indigo-600" />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 text-base">{cls.name}</span>
                                                    <span className="text-gray-300 text-xs font-mono">[{cls.code}]</span>
                                                    {showTypeTabs && <TypeBadge classType={cls.class_type} />}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {cls.sections?.length || 0} {cls.sections?.length === 1 ? sectionLabel(cls) : sectionsLabel(cls)}
                                                    </span>
                                                    {cls.class_type === 'COURSE' && cls.duration_weeks && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {cls.duration_weeks}w
                                                        </span>
                                                    )}
                                                    {cls.class_type === 'COURSE' && cls.course_fee && (
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> ₹{cls.course_fee}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCreateSection(cls.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 border border-indigo-200 text-indigo-600 rounded-lg text-xs font-black hover:bg-indigo-50 transition"
                                            >
                                                <Plus className="h-3 w-3" />
                                                {cls.class_type === 'COURSE' ? `Add ${terms.sectionLabel}` : 'Add Section'}
                                            </button>
                                            <button onClick={() => handleEditClass(cls)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClass(cls.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sections (Expanded) */}
                                {expandedClasses.has(cls.id) && (
                                    <div className="bg-gray-50 px-8 py-5 border-t border-gray-100">
                                        {cls.sections && cls.sections.length > 0 ? (
                                            <div>
                                                <h4 className="text-xs font-black text-gray-400 uppercase mb-3">
                                                    {cls.class_type === 'COURSE' ? terms.sectionsLabel : 'Sections'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {cls.sections.map(section => (
                                                        <div key={section.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition group/sec">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-black text-sm">
                                                                        {section.name}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-gray-900">
                                                                            {cls.class_type === 'COURSE' ? terms.sectionLabel : 'Section'} {section.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                                                            <Users className="w-3 h-3" /> Capacity: {section.capacity}
                                                                        </div>
                                                                        {section.room_number && (
                                                                            <div className="text-xs text-gray-400">Room: {section.room_number}</div>
                                                                        )}
                                                                        {section.class_teacher_details && (
                                                                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                                                                                Teacher: {section.class_teacher_details.user.first_name} {section.class_teacher_details.user.last_name}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1 opacity-0 group-hover/sec:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEditSection(section, cls.id)} className="p-1 text-indigo-400 hover:text-indigo-600 rounded transition">
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteSection(section.id)} className="p-1 text-red-400 hover:text-red-600 rounded transition">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-400">
                                                <p className="text-sm">No {cls.class_type === 'COURSE' ? terms.sectionsLabel.toLowerCase() : 'sections'} yet.</p>
                                                <button onClick={() => handleCreateSection(cls.id)} className="mt-1 text-indigo-600 text-xs font-bold hover:underline">
                                                    + Add {cls.class_type === 'COURSE' ? terms.sectionLabel : 'Section'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ClassModal
                isOpen={isClassModalOpen}
                onClose={() => { setIsClassModalOpen(false); setSelectedClass(undefined); }}
                onSubmit={handleSubmitClass}
                classData={selectedClass}
                isLoading={actionLoading}
            />

            <SectionModal
                isOpen={isSectionModalOpen}
                onClose={() => { setIsSectionModalOpen(false); setSelectedSection(undefined); }}
                onSubmit={handleSubmitSection}
                section={selectedSection}
                classId={currentClassForSection}
                isLoading={actionLoading}
            />
        </div>
    );
}
