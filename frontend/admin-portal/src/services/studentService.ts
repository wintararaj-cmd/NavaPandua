import api from './api';

export interface Student {
    id: string;
    admission_number: string;
    roll_number?: string;
    organization: string;
    school: string;
    current_class: string;
    section: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';


    place_of_birth?: string;
    mother_tongue?: string;
    nationality?: string;
    religion?: string;
    caste?: 'SC' | 'ST' | 'OBC' | 'GENERAL';
    blood_group?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    
    primary_contact_person?: string;
    primary_contact_phone?: string;
    relationship_with_student?: string;

    category: 'GENERAL' | 'STAFF';
    staff_name?: string;
    staff_id?: string;

    // Father Info
    father_name: string;
    father_phone: string;
    father_email?: string;
    father_qualification?: string;
    father_college?: string;
    father_occupation_type?: 'GOVT' | 'PRIVATE' | 'BUSINESS' | 'PROFESSIONAL' | 'OTHERS';
    father_occupation?: string;
    father_organisation?: string;
    father_designation?: string;
    father_income?: number;
    father_office_address?: string;
    
    // Mother Info
    mother_name: string;
    mother_phone: string;
    mother_email?: string;
    mother_qualification?: string;
    mother_college?: string;
    mother_associated_with?: string;
    
    // Previous School Info
    previous_school_name?: string;
    previous_school_address?: string;
    previous_school_city?: string;
    previous_school_state?: string;
    previous_school_country?: string;
    previous_school_pincode?: string;
    previous_school_principle_name?: string;
    previous_school_class?: string;
    previous_school_board?: string;
    previous_school_medium?: string;
    
    // Other Info
    is_single_parent?: boolean;
    legal_guardian?: string;
    is_guardian_father?: boolean;
    is_guardian_mother?: boolean;
    second_language?: string;
    third_language?: string;
    
    admission_date: string;
    is_active?: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'LEFT' | 'GRADUATED';
    fee_category?: string;
    house?: string;
    transport_type?: string;
    fee_payment_mode?: string;
    
    // Photos
    photo?: string;
    father_photo?: string;
    mother_photo?: string;
    
    class_details?: {
        id: string;
        name: string;
    };
    section_details?: {
        id: string;
        name: string;
    };
    siblings?: StudentSibling[];
}

export interface StudentSibling {
    id?: string;
    name: string;
    class_name?: string;
    section?: string;
    roll?: string;
    registration_number?: string;
}

export interface StudentFormData extends Omit<Student, 'id' | 'admission_number' | 'organization' | 'school' | 'class_details' | 'section_details' | 'siblings'> {
    admission_number?: string; // Optional during creation if auto-generated
    organization?: string;
    school?: string;
    siblings?: StudentSibling[];
}

export const studentService = {
    getStudents: async (params?: any) => {
        const response = await api.get('/students/', { params });
        return response.data;
    },

    getStudent: async (id: string) => {
        const response = await api.get(`/students/${id}/`);
        return response.data;
    },

    createStudent: async (data: any) => {
        const response = await api.post('/students/', data);
        return response.data;
    },

    updateStudent: async (id: string, data: any) => {
        const response = await api.patch(`/students/${id}/`, data);
        return response.data;
    },

    deleteStudent: async (id: string) => {
        const response = await api.delete(`/students/${id}/`);
        return response.data;
    },

    getPromotions: async (studentId: string) => {
        const response = await api.get('/students/promotions/', { params: { student: studentId } });
        return response.data;
    },

    promoteStudent: async (studentId: string, data: any) => {
        const response = await api.post(`/students/${studentId}/promote/`, data);
        return response.data;
    },
    bulkPromote: async (data: { students: string[]; to_class: string; to_session: string; from_session: string; to_section?: string; status?: string }) => {
        const response = await api.post('/students/bulk-promote/', data);
        return response.data;
    },

    importStudents: async (formData: FormData) => {
        const response = await api.post('/students/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },


    getSLCs: async (studentId: string) => {
        const response = await api.get('/students/slc/', { params: { student: studentId } });
        return response.data;
    },

    generateSLC: async (data: any) => {
        const response = await api.post('/students/slc/', data);
        return response.data;
    }
};
