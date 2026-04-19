import api from './api';

export interface Teacher {
    id: number;
    user: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        role: string;
        is_active: boolean;
        date_of_birth?: string | null;
        gender?: string;
        profile_picture?: string | null;
    };
    school: number;
    school_name: string;
    employee_id: string;
    department: string;
    designation: string;
    qualification: string;
    joining_date: string;
    created_at: string;
    updated_at: string;
}

export interface TeacherFormData {
    user: {
        email: string;
        first_name: string;
        last_name: string;
        phone?: string;
        password?: string;
        gender?: string;
        date_of_birth?: string;
    };
    employee_id: string;
    department: string;
    designation: string;
    qualification: string;
    joining_date: string;
}

export const teacherService = {
    getAll: async (params?: any) => {
        const response = await api.get('/teachers/', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/teachers/${id}/`);
        return response.data;
    },

    create: async (data: TeacherFormData) => {
        const response = await api.post('/teachers/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<TeacherFormData>) => {
        const response = await api.patch(`/teachers/${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/teachers/${id}/`);
    }
};
