import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UserPlus, GraduationCap, Mail, Phone, Calendar, FileText, CreditCard, X, Printer, Upload } from 'lucide-react';


import { studentService, type Student, type StudentFormData } from '../services/studentService';
import { useInstitutionTerms } from '../hooks/useInstitutionTerms';
import StudentModal from '../components/students/StudentModal';
import PromotionModal from '../components/students/PromotionModal';
import SLCModal from '../components/students/SLCModal';
import IDCard from '../components/students/IDCard';
import { schoolService, type School } from '../services/schoolService';
import toast from 'react-hot-toast';


export default function Students() {
    const terms = useInstitutionTerms();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [isSLCModalOpen, setIsSLCModalOpen] = useState(false);
    const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(undefined);

    const [school, setSchool] = useState<School | null>(null);
    const [actionLoading, setActionLoading] = useState(false);


    useEffect(() => {
        fetchStudents();
        fetchSchool();
    }, []);

    const fetchSchool = async () => {
        try {
            // Get current school from auth context or just fetch the first one for now
            // Usually there's an active school in context
            const data = await schoolService.getSchools();
            const schoolData = Array.isArray(data) ? data[0] : data.results?.[0];
            setSchool(schoolData);
        } catch (error) {
            console.error('Failed to fetch school info', error);
        }
    };


    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getStudents({ search: searchQuery });
            setStudents(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error(`Failed to fetch ${terms.studentsLabel.toLowerCase()}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents();
    };

    const handleCreate = () => {
        setSelectedStudent(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handlePromote = (student: Student) => {
        setSelectedStudent(student);
        setIsPromotionModalOpen(true);
    };

    const handleGenerateSLC = (student: Student) => {
        setSelectedStudent(student);
        setIsSLCModalOpen(true);
    };

    const handleGenerateIDCard = (student: Student) => {
        setSelectedStudent(student);
        setIsIDCardModalOpen(true);
    };


    const handleDelete = async (id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${terms.studentLabel.toLowerCase()}?`)) {
            try {
                await studentService.deleteStudent(id);
                toast.success('Deleted successfully');
                fetchStudents();
            } catch (error) {
                toast.error('Failed to delete');
                console.error(error);
            }
        }
    };

    const handleSubmit = async (data: FormData) => {
        try {
            setActionLoading(true);
            if (selectedStudent) {
                await studentService.updateStudent(selectedStudent.id, data);
                toast.success('Updated successfully');
            } else {
                await studentService.createStudent(data);
                toast.success('Created successfully');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            toast.error('Failed to save');
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{terms.studentsLabel}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and track your {terms.studentsLabel.toLowerCase()} across {terms.classesLabel.toLowerCase()}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                    >
                        <Upload className="w-5 h-5" />
                        Import
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add {terms.studentLabel}
                    </button>
                </div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder={`Search by name, ID or ${terms.classLabel.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    ID / Reg
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {terms.studentLabel} Details
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Roll No / DOB
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {terms.classLabel} / {terms.sectionLabel}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Contact Details
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        Loading records...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                        <div className="mb-3 flex justify-center">
                                            <UserPlus className="w-12 h-12 text-gray-100" />
                                        </div>
                                        <p className="font-medium">No {terms.studentsLabel.toLowerCase()} found</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                                {student.admission_number}
                                            </span>
                                            {student.roll_number && (
                                                <div className="text-[10px] text-gray-400 mt-1 font-bold">Roll: {student.roll_number}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-black relative group-hover:border-indigo-200 transition-colors">
                                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 leading-none">
                                                        {student.first_name} {student.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {student.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-700">
                                                {student.roll_number || 'N/A'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="font-bold text-gray-800">{student.class_details?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400 font-medium">Section: {student.section_details?.name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-bold text-gray-700">{student.father_name || student.mother_name}</div>
                                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium">
                                                <Phone className="w-3 h-3" /> {student.father_phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                student.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700' 
                                                    : student.status === 'LEFT' || student.status === 'GRADUATED'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {student.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handlePromote(student)}
                                                    title="Promote Student"
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <GraduationCap className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateIDCard(student)}
                                                    title="Generate ID Card"
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </button>
                                                <button

                                                    onClick={() => handleGenerateSLC(student)}
                                                    title="Generate SLC"
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                student={selectedStudent}
                isLoading={actionLoading}
            />

            <PromotionModal 
                isOpen={isPromotionModalOpen}
                onClose={() => setIsPromotionModalOpen(false)}
                student={selectedStudent || null}
                onSuccess={fetchStudents}
            />

            <SLCModal 
                isOpen={isSLCModalOpen}
                onClose={() => setIsSLCModalOpen(false)}
                student={selectedStudent || null}
                onSuccess={fetchStudents}
            />

            {/* ID Card Modal */}
            {isIDCardModalOpen && selectedStudent && school && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Student ID Card Preview</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.print()}
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 px-4 text-xs font-bold"
                                >
                                    <Printer className="w-4 h-4" /> Print Card
                                </button>
                                <button onClick={() => setIsIDCardModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-xl border border-gray-200">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-100/50">
                            <IDCard student={selectedStudent} school={school} />
                        </div>
                        <div className="px-6 py-4 bg-indigo-50 text-indigo-600 text-xs font-bold text-center">
                            Tip: Make sure "Background Graphics" is enabled in print settings for the best result.
                        </div>
                    </div>
                </div>
            )}
            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Import {terms.studentsLabel}</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h4 className="text-sm font-bold text-indigo-800 mb-2">CSV Format Instructions</h4>
                                <p className="text-xs text-indigo-600 leading-relaxed">
                                    Your CSV file should have headers: <code className="bg-white px-1 rounded">first_name</code>, <code className="bg-white px-1 rounded">last_name</code>, <code className="bg-white px-1 rounded">admission_number</code>, <code className="bg-white px-1 rounded">class</code>, <code className="bg-white px-1 rounded">section</code>.
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
                                                const response = await studentService.importStudents(formData);
                                                toast.success(`Successfully imported ${response.success} students!`);
                                                setIsImportModalOpen(false);
                                                fetchStudents();
                                            } catch (error: any) {
                                                const errorData = error.response?.data;
                                                toast.error(errorData?.error || 'Failed to import students');
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
