import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Student, StudentFormData } from '../../services/studentService';
import { organizationService } from '../../services/organizationService';
import { schoolService } from '../../services/schoolService';
import { classService } from '../../services/classService';
import toast from 'react-hot-toast';

interface StudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: StudentFormData) => Promise<void>;
    student?: Student;
    isLoading?: boolean;
}

interface Organization {
    id: string;
    name: string;
}

interface School {
    id: string;
    name: string;
}

interface Class {
    id: string;
    name: string;
}

interface Section {
    id: string;
    name: string;
}

export default function StudentModal({ isOpen, onClose, onSubmit, student, isLoading }: StudentModalProps) {
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

    useEffect(() => {
        if (formData.organization) {
            fetchSchools(formData.organization);
        }
    }, [formData.organization]);

    useEffect(() => {
        if (formData.school) {
            fetchClasses(formData.school);
        }
    }, [formData.school]);

    useEffect(() => {
        if (formData.class_assigned) {
            fetchSections(formData.class_assigned);
        }
    }, [formData.class_assigned]);

    const fetchOrganizations = async () => {
        try {
            const data = await organizationService.getAll();
            setOrganizations(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch organizations');
        }
    };

    const fetchSchools = async (orgId: string) => {
        try {
            const data = await schoolService.getAll({ organization: orgId });
            setSchools(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch schools');
        }
    };

    const fetchClasses = async (schoolId: string) => {
        try {
            const data = await classService.getAll({ school: schoolId });
            setClasses(data.results || []);
        } catch (error) {
            toast.error('Failed to fetch classes');
        }
    };

    const fetchSections = async (classId: string) => {
        try {
            const data = await classService.getSections(classId);
            setSections(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            toast.error('Failed to fetch sections');
        }
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {student ? 'Edit Student' : 'Add New Student'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admission Number *
                                </label>
                                <input
                                    type="text"
                                    name="admission_number"
                                    value={formData.admission_number}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admission Date *
                                </label>
                                <input
                                    type="date"
                                    name="admission_date"
                                    value={formData.admission_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization *
                                </label>
                                <select
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Organization</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    School *
                                </label>
                                <select
                                    name="school"
                                    value={formData.school}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.organization}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                >
                                    <option value="">Select School</option>
                                    {schools.map(school => (
                                        <option key={school.id} value={school.id}>{school.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class *
                                </label>
                                <select
                                    name="class_assigned"
                                    value={formData.class_assigned}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.school}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section *
                                </label>
                                <select
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.class_assigned}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>{section.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Group
                                </label>
                                <select
                                    name="blood_group"
                                    value={formData.blood_group}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parent Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Father's Details</h4>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father's Name *
                                </label>
                                <input
                                    type="text"
                                    name="father_name"
                                    value={formData.father_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father's Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="father_phone"
                                    value={formData.father_phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father's Email
                                </label>
                                <input
                                    type="email"
                                    name="father_email"
                                    value={formData.father_email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Father's Occupation
                                </label>
                                <input
                                    type="text"
                                    name="father_occupation"
                                    value={formData.father_occupation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">Mother's Details</h4>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mother's Name *
                                </label>
                                <input
                                    type="text"
                                    name="mother_name"
                                    value={formData.mother_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mother's Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="mother_phone"
                                    value={formData.mother_phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mother's Email
                                </label>
                                <input
                                    type="email"
                                    name="mother_email"
                                    value={formData.mother_email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mother's Occupation
                                </label>
                                <input
                                    type="text"
                                    name="mother_occupation"
                                    value={formData.mother_occupation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guardian & Emergency Contact */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian & Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Name
                                </label>
                                <input
                                    type="text"
                                    name="guardian_name"
                                    value={formData.guardian_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Phone
                                </label>
                                <input
                                    type="tel"
                                    name="guardian_phone"
                                    value={formData.guardian_phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Email
                                </label>
                                <input
                                    type="email"
                                    name="guardian_email"
                                    value={formData.guardian_email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Guardian Relation
                                </label>
                                <input
                                    type="text"
                                    name="guardian_relation"
                                    value={formData.guardian_relation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Name
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emergency Contact Relation
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact_relation"
                                    value={formData.emergency_contact_relation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Previous School Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Previous School Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Previous School
                                </label>
                                <input
                                    type="text"
                                    name="previous_school"
                                    value={formData.previous_school}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Previous Class
                                </label>
                                <input
                                    type="text"
                                    name="previous_class"
                                    value={formData.previous_class}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active Student</span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
