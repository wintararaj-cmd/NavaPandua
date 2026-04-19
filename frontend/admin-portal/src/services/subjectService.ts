import api from './api';

export interface Subject {
    id: string;
    school: string;
    name: string;
    code: string;
    description?: string;
    subject_type: 'THEORY' | 'PRACTICAL' | 'BOTH';
    created_at?: string;
    updated_at?: string;
}

export interface SubjectFormData {
    school: string;
    name: string;
    code: string;
    description?: string;
    subject_type: 'THEORY' | 'PRACTICAL' | 'BOTH';
}

export const subjectService = {
    getAll: async (params?: any) => {
        const response = await api.get('/subjects/', { params });
        return response.data;
    },

    getSubjects: async (params?: any) => {
        const response = await api.get('/subjects/', { params });
        return response.data;
    },

    getSubject: async (id: string) => {
        const response = await api.get(`/subjects/${id}/`);
        return response.data;
    },

    createSubject: async (data: SubjectFormData) => {
        const response = await api.post('/subjects/', data);
        return response.data;
    },

    updateSubject: async (id: string, data: SubjectFormData) => {
        const response = await api.patch(`/subjects/${id}/`, data);
        return response.data;
    },

    deleteSubject: async (id: string) => {
        const response = await api.delete(`/subjects/${id}/`);
        return response.data;
    }
};
