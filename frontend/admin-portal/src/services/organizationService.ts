
import api from './api';

export interface Organization {
    id: string;
    name: string;
    subdomain: string;
    website?: string;
    phone: string;
    email: string;
    address_line1: string;
    city: string;
    state: string;
    country: string;
    full_address?: string;
    is_active: boolean;
    subscription_plan: string;
    total_schools?: number;
    total_students?: number;
    created_at: string;
}

export const organizationService = {
    getAll: async (params?: any) => {
        const response = await api.get('/organizations/', { params });
        return response.data;
    },

    getOrganizations: async (params?: any) => {
        const response = await api.get('/organizations/', { params });
        return response.data;
    },

    getOrganization: async (id: string) => {
        const response = await api.get(`/organizations/${id}/`);
        return response.data;
    },

    createOrganization: async (data: any) => {
        const response = await api.post('/organizations/', data);
        return response.data;
    },

    updateOrganization: async (id: string, data: any) => {
        const response = await api.patch(`/organizations/${id}/`, data);
        return response.data;
    },

    deleteOrganization: async (id: string) => {
        const response = await api.delete(`/organizations/${id}/`);
        return response.data;
    }
};
