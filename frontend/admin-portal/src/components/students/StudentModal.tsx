import React, { useState, useEffect } from 'react';
import { X, User, Shield, Phone, Mail, MapPin, GraduationCap, Building2 } from 'lucide-react';
import type { Student, StudentFormData } from '../../services/studentService';
import { organizationService } from '../../services/organizationService';
import { schoolService } from '../../services/schoolService';
import { classService } from '../../services/classService';
import { useInstitutionTerms } from '../../hooks/useInstitutionTerms';
import toast from 'react-hot-toast';

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: StudentFormData) => Promise<void>;
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
        class_assigned: '',
        section: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'MALE',
        blood_group: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        father_name: '',
        father_phone: '',
        father_email: '',
        father_occupation: '',
        mother_name: '',
        mother_phone: '',
        mother_email: '',
        mother_occupation: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_email: '',
        guardian_relation: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        previous_school: '',
        previous_class: '',
        admission_date: new Date().toISOString().split('T')[0],
        is_active: true,
    });

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'personal' | 'parents' | 'contact'>('basic');

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
    useEffect(() => { if (formData.class_assigned) fetchSections(formData.class_assigned); }, [formData.class_assigned]);

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
            admission_number: student.admission_number || '',
            organization: student.organization || '',
            school: student.school || '',
            class_assigned: student.class_assigned || '',
            section: student.section || '',
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            email: student.email || '',
            phone: student.phone || '',
            date_of_birth: student.date_of_birth || '',
            gender: student.gender || 'MALE',
            blood_group: student.blood_group || '',
            address: student.address || '',
            city: student.city || '',
            state: student.state || '',
            postal_code: student.postal_code || '',
            country: student.country || 'India',
            father_name: student.father_name || '',
            father_phone: student.father_phone || '',
            father_email: student.father_email || '',
            father_occupation: student.father_occupation || '',
            mother_name: student.mother_name || '',
            mother_phone: student.mother_phone || '',
            mother_email: student.mother_email || '',
            mother_occupation: student.mother_occupation || '',
            guardian_name: student.guardian_name || '',
            guardian_phone: student.guardian_phone || '',
            guardian_email: student.guardian_email || '',
            guardian_relation: student.guardian_relation || '',
            emergency_contact_name: student.emergency_contact_name || '',
            emergency_contact_phone: student.emergency_contact_phone || '',
            emergency_contact_relation: student.emergency_contact_relation || '',
            previous_school: student.previous_school || '',
            previous_class: student.previous_class || '',
            admission_date: student.admission_date || new Date().toISOString().split('T')[0],
            is_active: student.is_active ?? true,
        });
    };

    const resetForm = () => {
        setFormData({
            admission_number: '',
            organization: '',
            school: '',
            class_assigned: '',
            section: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: 'MALE',
            blood_group: '',
            address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            father_name: '',
            father_phone: '',
            father_email: '',
            father_occupation: '',
            mother_name: '',
            mother_phone: '',
            mother_email: '',
            mother_occupation: '',
            guardian_name: '',
            guardian_phone: '',
            guardian_email: '',
            guardian_relation: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            emergency_contact_relation: '',
            previous_school: '',
            previous_class: '',
            admission_date: new Date().toISOString().split('T')[0],
            is_active: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (!isOpen) return null;

    const sections_list = [
        { id: 'basic', label: 'Academic', icon: GraduationCap },
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'parents', label: 'Family', icon: Shield },
        { id: 'contact', label: 'Address', icon: MapPin },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {student ? `Edit ${terms.studentLabel}` : `Register New ${terms.studentLabel}`}
                        </h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Enrollment Form</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X className="h-6 w-6" />
                    </button>
                </div>

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
                            <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                    {activeTab === 'basic' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Registration Details</h4>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Admission / ID Number *</label>
                                        <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Admission Date *</label>
                                        <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Allocation</h4>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Parent Organization *</label>
                                        <select name="organization" value={formData.organization} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                            <option value="">Select</option>
                                            {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{terms.institutionLabel} *</label>
                                        <select name="school" value={formData.school} onChange={handleChange} required disabled={!formData.organization} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50">
                                            <option value="">Select</option>
                                            {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Academic Grouping</h4>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{terms.classLabel} *</label>
                                        <select name="class_assigned" value={formData.class_assigned} onChange={handleChange} required disabled={!formData.school} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50">
                                            <option value="">Select {terms.classLabel}</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{terms.sectionLabel} *</label>
                                        <select name="section" value={formData.section} onChange={handleChange} required disabled={!formData.class_assigned} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50">
                                            <option value="">Select {terms.sectionLabel}</option>
                                            {sections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">First Name *</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Last Name *</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Date of Birth *</label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Gender *</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['MALE', 'FEMALE'].map(g => (
                                            <button key={g} type="button" onClick={() => setFormData(p => ({ ...p, gender: g }))} className={`py-3 text-[10px] font-black rounded-xl transition-all ${formData.gender === g ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Blood Group</label>
                                    <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">Unknown</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'parents' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] pb-2 border-b border-indigo-50">Father's Information</h4>
                                <div className="space-y-4">
                                    <input type="text" name="father_name" placeholder="Full Name *" value={formData.father_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    <input type="tel" name="father_phone" placeholder="Mobile Number *" value={formData.father_phone} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    <input type="text" name="father_occupation" placeholder="Occupation" value={formData.father_occupation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-pink-600 uppercase tracking-[0.2em] pb-2 border-b border-pink-50">Mother's Information</h4>
                                <div className="space-y-4">
                                    <input type="text" name="mother_name" placeholder="Full Name *" value={formData.mother_name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    <input type="tel" name="mother_phone" placeholder="Mobile Number *" value={formData.mother_phone} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                    <input type="text" name="mother_occupation" placeholder="Occupation" value={formData.mother_occupation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-full">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Residential Address</label>
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
                            <div className="pt-8 border-t border-gray-100 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Set as Active Record</label>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                        <GraduationCap className="w-4 h-4" />
                        {activeTab} Details
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="px-8 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                        <button type="submit" onClick={handleSubmit} className="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50" disabled={isLoading}>
                            {isLoading ? 'Processing...' : student ? 'Save Changes' : `Enroll ${terms.studentLabel}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
