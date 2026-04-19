
import api from './api';

export interface School {
    id: string;
    organization: string; // ID
    organization_name?: string;
    name: string;
    code: string;
    board: string;
    medium: string;
    // Contact
    phone: string;
    email: string;
    website?: string;
    // Address
    address_line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    full_address?: string;
    // Stats
    total_students?: number;
    total_teachers?: number;
    total_classes?: number;
    is_active: boolean;
    created_at: string;
    [key: string]: any;
}

export const schoolService = {
    getAll: async (params?: any) => {
        const response = await api.get('/schools/', { params });
        return response.data;
    },

    getSchools: async (params?: any) => {
        const response = await api.get('/schools/', { params });
        return response.data;
    },

    getSchool: async (id: string) => {
        const response = await api.get(`/schools/${id}/`);
        return response.data;
    },

    createSchool: async (data: any) => {
        const response = await api.post('/schools/', data);
        return response.data;
    },

    updateSchool: async (id: string, data: any) => {
        const response = await api.patch(`/schools/${id}/`, data);
        return response.data;
    },

    deleteSchool: async (id: string) => {
        const response = await api.delete(`/schools/${id}/`);
        return response.data;
    }
};
