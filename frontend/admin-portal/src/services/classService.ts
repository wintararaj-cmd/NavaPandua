import api from './api';

export interface Teacher {
    id: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface Section {
    id: string;
    class_group: string;
    name: string;
    class_teacher?: string;
    class_teacher_details?: Teacher;
    room_number?: string;
    capacity: number;
    created_at?: string;
    updated_at?: string;
}

export interface Class {
    id: string;
    school: string;
    name: string;
    code: string;
    description?: string;
    sections?: Section[];
    created_at?: string;
    updated_at?: string;
}

export interface ClassFormData {
    school: string;
    name: string;
    code: string;
    description?: string;
}

export interface SectionFormData {
    class_group: string;
    name: string;
    class_teacher?: string | null;
    room_number?: string;
    capacity: number;
}

export const classService = {
    // Class CRUD operations
    getAll: async (params?: any) => {
        const response = await api.get('/classes/', { params });
        return response.data;
    },

    getClasses: async (params?: any) => {
        const response = await api.get('/classes/', { params });
        return response.data;
    },

    getClass: async (id: string) => {
        const response = await api.get(`/classes/${id}/`);
        return response.data;
    },

    createClass: async (data: ClassFormData) => {
        const response = await api.post('/classes/', data);
        return response.data;
    },

    updateClass: async (id: string, data: ClassFormData) => {
        const response = await api.patch(`/classes/${id}/`, data);
        return response.data;
    },

    deleteClass: async (id: string) => {
        const response = await api.delete(`/classes/${id}/`);
        return response.data;
    },

    // Section CRUD operations
    getSections: async (params?: any) => {
        // Ensure params is an object for axios
        const response = await api.get('/classes/sections/', {
            params: typeof params === 'string' ? { class_group: params } : params
        });
        return response.data;
    },

    getSection: async (id: string) => {
        const response = await api.get(`/classes/sections/${id}/`);
        return response.data;
    },

    createSection: async (data: SectionFormData) => {
        const response = await api.post('/classes/sections/', data);
        return response.data;
    },

    updateSection: async (id: string, data: SectionFormData) => {
        const response = await api.patch(`/classes/sections/${id}/`, data);
        return response.data;
    },

    deleteSection: async (id: string) => {
        const response = await api.delete(`/classes/sections/${id}/`);
        return response.data;
    }
};
