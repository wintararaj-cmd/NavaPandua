import React, { useState, useEffect } from 'react';
import { X, User, Shield, Phone, Mail, MapPin, GraduationCap, Building2, BookOpen, FileText, Languages, UserCheck, Heart } from 'lucide-react';
import type { Student, StudentFormData, StudentSibling } from '../../services/studentService';
import { organizationService } from '../../services/organizationService';
import { schoolService } from '../../services/schoolService';
import { classService } from '../../services/classService';
import { useInstitutionTerms } from '../../hooks/useInstitutionTerms';
import toast from 'react-hot-toast';

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    student?: Student;
    isLoading?: boolean;
}

interface Organization { id: string; name: string; }
interface School { id: string; name: string; }
interface Class { id: string; name: string; }
interface Section { id: string; name: string; }

export default function StudentModal({ isOpen, onClose, onSubmit, student, isLoading }: StudentModalProps) {
    const terms = useInstitutionTerms();
    const [formData, setFormData] = useState<StudentFormData>({
        admission_number: '',
        organization: '',
        school: '',
        current_class: '',
        section: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'MALE',
        place_of_birth: '',
        mother_tongue: '',
        nationality: 'Indian',
        religion: '',
        caste: 'GENERAL',
        blood_group: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        
        // Father
        father_name: '',
        father_phone: '',
        father_email: '',
        father_qualification: '',
        father_college: '',
        father_occupation: '',
        father_organisation: '',
        father_designation: '',
        father_income: 0,
        father_office_address: '',
        
        // Mother
        mother_name: '',
        mother_phone: '',
        mother_email: '',
        mother_qualification: '',
        mother_college: '',
        
        // Previous School
        previous_school_name: '',
        previous_school_address: '',
        previous_school_class: '',
        previous_school_board: '',
        previous_school_medium: '',
        
        // Other
        is_single_parent: false,
        legal_guardian: '',
        second_language: '',
        third_language: '',
        admission_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        fee_category: '',
        house: '',
        transport_type: '',
        fee_payment_mode: '',
        photo: '',
        father_photo: '',
        mother_photo: '',
        siblings: []
    });
 
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        photo: null,
        father_photo: null,
        mother_photo: null
    });

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'student' | 'family' | 'academic' | 'other' | 'address'>('basic');

    useEffect(() => {
        if (isOpen) {
            fetchOrganizations();
            if (student) {
                populateFormData(student);
            } else {
                resetForm();
            }
        }
    }, [isOpen, student]);

    useEffect(() => { if (formData.organization) fetchSchools(formData.organization); }, [formData.organization]);
    useEffect(() => { if (formData.school) fetchClasses(formData.school); }, [formData.school]);
    useEffect(() => { if (formData.current_class) fetchSections(formData.current_class); }, [formData.current_class]);

    const fetchOrganizations = async () => {
        try {
            const data = await organizationService.getAll();
            setOrganizations(data.results || []);
        } catch (error) { toast.error('Failed to fetch organizations'); }
    };

    const fetchSchools = async (orgId: string) => {
        try {
            const data = await schoolService.getAll({ organization: orgId });
            setSchools(data.results || []);
        } catch (error) { toast.error(`Failed to fetch ${terms.institutionLabel.toLowerCase()}s`); }
    };

    const fetchClasses = async (schoolId: string) => {
        try {
            const data = await classService.getAll({ school: schoolId });
            setClasses(data.results || []);
        } catch (error) { toast.error(`Failed to fetch ${terms.classesLabel.toLowerCase()}`); }
    };

    const fetchSections = async (classId: string) => {
        try {
            const data = await classService.getSections(classId);
            setSections(Array.isArray(data) ? data : data.results || []);
        } catch (error) { toast.error(`Failed to fetch ${terms.sectionsLabel.toLowerCase()}`); }
    };

    const populateFormData = (student: Student) => {
        setFormData({
            ...student,
            admission_number: student.admission_number || '',
            organization: student.organization || '',
            school: student.school || '',
            current_class: student.current_class || '',
            section: student.section || '',
            first_name: student.first_name || '',
            middle_name: student.middle_name || '',
            last_name: student.last_name || '',
            email: student.email || '',
            phone: student.phone || '',
            date_of_birth: student.date_of_birth || '',
            gender: student.gender || 'MALE',
            admission_date: student.admission_date || new Date().toISOString().split('T')[0],
            status: student.status || 'ACTIVE',
            siblings: student.siblings || []
        });
    };

    const resetForm = () => {
        setFormData({
            admission_number: '',
            organization: '',
            school: '',
            current_class: '',
            section: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: 'MALE',
            place_of_birth: '',
            mother_tongue: '',
            nationality: 'Indian',
            religion: '',
            caste: 'GENERAL',
            blood_group: '',
            address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            father_name: '',
            father_phone: '',
            father_email: '',
            father_qualification: '',
            father_college: '',
            father_occupation: '',
            father_organisation: '',
            father_designation: '',
            father_income: 0,
            father_office_address: '',
            mother_name: '',
            mother_phone: '',
            mother_email: '',
            mother_qualification: '',
            mother_college: '',
            previous_school_name: '',
            previous_school_address: '',
            previous_school_class: '',
            previous_school_board: '',
            previous_school_medium: '',
            is_single_parent: false,
            legal_guardian: '',
            second_language: '',
            third_language: '',
            admission_date: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            fee_category: '',
            house: '',
            transport_type: '',
            fee_payment_mode: '',
            siblings: []
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = new FormData();
        
        // Append all form data
        Object.keys(formData).forEach(key => {
            if (key === 'siblings') {
                data.append(key, JSON.stringify(formData[key]));
            } else if (key !== 'photo' && key !== 'father_photo' && key !== 'mother_photo') {
                const value = (formData as any)[key];
                if (value !== undefined && value !== null) {
                    data.append(key, String(value));
                }
            }
        });
 
        // Append files
        if (files.photo) data.append('photo', files.photo);
        if (files.father_photo) data.append('father_photo', files.father_photo);
        if (files.mother_photo) data.append('mother_photo', files.mother_photo);
 
        await onSubmit(data);
    };
 
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                    type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSiblingChange = (index: number, field: keyof StudentSibling, value: string) => {
        const newSiblings = [...(formData.siblings || [])];
        newSiblings[index] = { ...newSiblings[index], [field]: value };
        setFormData(prev => ({ ...prev, siblings: newSiblings }));
    };

    const addSibling = () => {
        setFormData(prev => ({ 
            ...prev, 
            siblings: [...(prev.siblings || []), { name: '', class_name: '', section: '', roll: '', registration_number: '' }] 
        }));
    };

    const removeSibling = (index: number) => {
        const newSiblings = [...(formData.siblings || [])];
        newSiblings.splice(index, 1);
        setFormData(prev => ({ ...prev, siblings: newSiblings }));
    };

    if (!isOpen) return null;

    const sections_list = [
        { id: 'basic', label: 'Registration', icon: GraduationCap },
        { id: 'student', label: 'Student', icon: User },
        { id: 'family', label: 'Family', icon: Shield },
        { id: 'academic', label: 'Academic History', icon: BookOpen },
        { id: 'other', label: 'Additional', icon: Heart },
        { id: 'address', label: 'Address', icon: MapPin },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {student ? `Edit ${terms.studentLabel}` : `Student Admission Form`}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Tiny Tech ERP System</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-8 bg-white overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {sections_list.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveTab(s.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 border-b-4 transition-all ${
                                activeTab === s.id 
                                ? 'border-indigo-600 text-indigo-600' 
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <s.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Basic / Registration Tab */}
                    {activeTab === 'basic' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Identification</h4>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Admission / Receipt No *</label>
                                        <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Admission Date *</label>
                                        <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Institution Allocation</h4>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Organization *</label>
                                        <select name="organization" value={formData.organization} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                            <option value="">Select</option>
                                            {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{terms.institutionLabel} *</label>
                                        <select name="school" value={formData.school} onChange={handleChange} required disabled={!formData.organization} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none disabled:opacity-50">
                                            <option value="">Select</option>
                                            {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Academic Grouping</h4>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Seeking Admission in Class *</label>
                                        <select name="current_class" value={formData.current_class} onChange={handleChange} required disabled={!formData.school} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none disabled:opacity-50">
                                            <option value="">Select Class</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Section</label>
                                        <select name="section" value={formData.section} onChange={handleChange} disabled={!formData.current_class} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none disabled:opacity-50">
                                            <option value="">Select Section</option>
                                            {sections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Tab */}
                    {activeTab === 'student' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">First Name *</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Middle Name</label>
                                    <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Last Name *</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Date of Birth *</label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Place of Birth</label>
                                    <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Nationality</label>
                                    <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Religion</label>
                                    <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Caste</label>
                                    <select name="caste" value={formData.caste} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                        <option value="GENERAL">General</option>
                                        <option value="OBC">OBC</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Mother Tongue</label>
                                    <input type="text" name="mother_tongue" value={formData.mother_tongue} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Blood Group</label>
                                    <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                        <option value="">Unknown</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Student Photo</label>
                                    <input type="file" name="photo" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs" />
                                    {student?.photo && !files.photo && <p className="text-[10px] text-indigo-600 mt-1 font-bold">Current: {student.photo.split('/').pop()}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Family Tab */}
                    {activeTab === 'family' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-12">
                            {/* Father's Information */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" /> Father's Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Father's Name *</label>
                                        <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Qualification</label>
                                        <input type="text" name="father_qualification" value={formData.father_qualification} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">College/University</label>
                                        <input type="text" name="father_college" value={formData.father_college} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Occupation</label>
                                        <input type="text" name="father_occupation" value={formData.father_occupation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Organisation Name</label>
                                        <input type="text" name="father_organisation" value={formData.father_organisation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Annual Income</label>
                                        <input type="number" name="father_income" value={formData.father_income} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Contact No *</label>
                                        <input type="tel" name="father_phone" value={formData.father_phone} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Email ID</label>
                                        <input type="email" name="father_email" value={formData.father_email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Designation</label>
                                        <input type="text" name="father_designation" value={formData.father_designation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Mother's Information */}
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <h4 className="text-xs font-black text-pink-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <UserCheck className="w-4 h-4" /> Mother's Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Mother's Name *</label>
                                        <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Qualification</label>
                                        <input type="text" name="mother_qualification" value={formData.mother_qualification} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">College/University</label>
                                        <input type="text" name="mother_college" value={formData.mother_college} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Contact No *</label>
                                        <input type="tel" name="mother_phone" value={formData.mother_phone} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Email ID</label>
                                        <input type="email" name="mother_email" value={formData.mother_email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Father's Photo</label>
                                        <input type="file" name="father_photo" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Mother's Photo</label>
                                        <input type="file" name="mother_photo" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Academic History Tab */}
                    {activeTab === 'academic' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                            <h4 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">Previous School/Montessori Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Name of the School</label>
                                    <input type="text" name="previous_school_name" value={formData.previous_school_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Board / Affiliation</label>
                                    <input type="text" name="previous_school_board" value={formData.previous_school_board} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Last Class Attended</label>
                                    <input type="text" name="previous_school_class" value={formData.previous_school_class} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Medium of Instruction</label>
                                    <input type="text" name="previous_school_medium" value={formData.previous_school_medium} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">School Address</label>
                                    <input type="text" name="previous_school_address" value={formData.previous_school_address} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Info Tab */}
                    {activeTab === 'other' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Languages</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">2nd Language</label>
                                            <input type="text" name="second_language" value={formData.second_language} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">3rd Language</label>
                                            <input type="text" name="third_language" value={formData.third_language} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Guardianship</h4>
                                    <div className="flex items-center gap-4 py-3">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="is_single_parent" checked={formData.is_single_parent} onChange={handleChange} className="w-5 h-5 rounded-lg border-2 border-gray-200 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">Single Parent</span>
                                        </label>
                                    </div>
                                    {formData.is_single_parent && (
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Legal Guardian Name</label>
                                            <input type="text" name="legal_guardian" value={formData.legal_guardian} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Siblings */}
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Details of Siblings</h4>
                                    <button type="button" onClick={addSibling} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl hover:bg-indigo-100 transition-colors">
                                        Add Sibling
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.siblings?.map((sibling, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-2xl relative group">
                                            <button type="button" onClick={() => removeSibling(index)} className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50">
                                                <X className="w-3 h-3" />
                                            </button>
                                            <input type="text" placeholder="Name" value={sibling.name} onChange={(e) => handleSiblingChange(index, 'name', e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none" />
                                            <input type="text" placeholder="Class" value={sibling.class_name} onChange={(e) => handleSiblingChange(index, 'class_name', e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none" />
                                            <input type="text" placeholder="Sec" value={sibling.section} onChange={(e) => handleSiblingChange(index, 'section', e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none" />
                                            <input type="text" placeholder="Roll" value={sibling.roll} onChange={(e) => handleSiblingChange(index, 'roll', e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none" />
                                            <input type="text" placeholder="Regn No" value={sibling.registration_number} onChange={(e) => handleSiblingChange(index, 'registration_number', e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none" />
                                        </div>
                                    ))}
                                    {(!formData.siblings || formData.siblings.length === 0) && (
                                        <p className="text-center py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">No siblings recorded</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Address & Status Tab */}
                    {activeTab === 'address' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-full">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Residential Address *</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    <input type="text" name="postal_code" placeholder="PIN Code" value={formData.postal_code} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-mono" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>
                            
                            <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Transport Type</label>
                                    <select name="transport_type" value={formData.transport_type} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                        <option value="">Select</option>
                                        <option value="BUS">School Bus</option>
                                        <option value="VAN">Van</option>
                                        <option value="PERSONAL">Personal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Fee Payment Mode</label>
                                    <select name="fee_payment_mode" value={formData.fee_payment_mode} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-2xl outline-none">
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="LEFT">Left / SLC Generated</option>
                                        <option value="GRADUATED">Graduated</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        <User className="w-4 h-4 text-indigo-600" />
                        Section: {activeTab}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="px-8 py-3 text-xs font-black text-gray-500 hover:bg-gray-100 rounded-2xl transition-all uppercase tracking-widest">Cancel</button>
                        <button type="submit" onClick={handleSubmit} className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]" disabled={isLoading}>
                            {isLoading ? 'Processing...' : student ? 'Save Changes' : `Enroll ${terms.studentLabel}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
