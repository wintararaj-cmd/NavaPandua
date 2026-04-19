import api from './api';

export interface Student {
    id: string;
    admission_number: string;
    roll_number?: string;
    organization: string;
    school: string;
    class_assigned: string;
    section: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    blood_group?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    father_name: string;
    father_phone: string;
    father_email?: string;
    father_occupation?: string;
    mother_name: string;
    mother_phone: string;
    mother_email?: string;
    mother_occupation?: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
    guardian_relation?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    previous_school?: string;
    previous_class?: string;
    admission_date: string;
    is_active: boolean;
    class_details?: {
        id: string;
        name: string;
    };
    section_details?: {
        id: string;
        name: string;
    };
}

export interface StudentFormData {
    admission_number: string;
    organization: string;
    school: string;
    class_assigned: string;
    section: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    blood_group?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    father_name: string;
    father_phone: string;
    father_email?: string;
    father_occupation?: string;
    mother_name: string;
    mother_phone: string;
    mother_email?: string;
    mother_occupation?: string;
    guardian_name?: string;
    guardian_phone?: string;
    guardian_email?: string;
    guardian_relation?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    previous_school?: string;
    previous_class?: string;
    admission_date: string;
    is_active: boolean;
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
    }
};
