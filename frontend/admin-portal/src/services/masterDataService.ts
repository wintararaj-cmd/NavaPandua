import api from './api';

export interface MasterDataItem {
    id: string;
    school: string;
    domain: string;
    identifier: string;
    description: string;
    created_at?: string;
    updated_at?: string;
}

export const masterDataService = {
    getAll: async (schoolId: string, params?: any) => {
        const response = await api.get(`/schools/${schoolId}/master-data/`, { params });
        return response.data;
    },

    getByDomain: async (schoolId: string, domain: string) => {
        const response = await api.get(`/schools/${schoolId}/master-data/`, { 
            params: { domain } 
        });
        return response.data;
    },

    create: async (schoolId: string, data: Partial<MasterDataItem>) => {
        const response = await api.post(`/schools/${schoolId}/master-data/`, data);
        return response.data;
    },

    update: async (schoolId: string, id: string, data: Partial<MasterDataItem>) => {
        const response = await api.patch(`/schools/${schoolId}/master-data/${id}/`, data);
        return response.data;
    },

    delete: async (schoolId: string, id: string) => {
        await api.delete(`/schools/${schoolId}/master-data/${id}/`);
    }
};
