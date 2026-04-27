
import api from './api';

export interface AdmissionEnquiry {
    id: string;
    student_name: string;
    parent_name: string;
    phone: string;
    email?: string;
    target_class?: string;
    status: 'NEW' | 'CONTACTED' | 'VISITED' | 'APPLICATION_PURCHASED' | 'CLOSED';
    created_at: string;
}

export interface AdmissionApplication {
    id: string;
    application_number: string;
    first_name: string;
    last_name: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED' | 'ADMITTED';
    created_at: string;
}

export const admissionsService = {
    // Enquiries
    getEnquiries: async (params?: any) => {
        const response = await api.get('/admissions/enquiries/', { params });
        return response.data;
    },

    getEnquiry: async (id: string) => {
        const response = await api.get(`/admissions/enquiries/${id}/`);
        return response.data;
    },

    createEnquiry: async (data: any) => {
        const response = await api.post('/admissions/enquiries/', data);
        return response.data;
    },

    updateEnquiry: async (id: string, data: any) => {
        const response = await api.patch(`/admissions/enquiries/${id}/`, data);
        return response.data;
    },

    deleteEnquiry: async (id: string) => {
        const response = await api.delete(`/admissions/enquiries/${id}/`);
        return response.data;
    },

    // Applications
    getApplications: async (params?: any) => {
        const response = await api.get('/admissions/applications/', { params });
        return response.data;
    },

    getApplication: async (id: string) => {
        const response = await api.get(`/admissions/applications/${id}/`);
        return response.data;
    },

    createApplication: async (data: any) => {
        const response = await api.post('/admissions/applications/', data);
        return response.data;
    },

    updateApplication: async (id: string, data: any) => {
        const response = await api.patch(`/admissions/applications/${id}/`, data);
        return response.data;
    },

    deleteApplication: async (id: string) => {
        const response = await api.delete(`/admissions/applications/${id}/`);
        return response.data;
    },

    downloadApplicationForm: async (id: string) => {
        const response = await api.get(`/admissions/applications/${id}/download_form/`, { responseType: 'blob' });
        return response.data;
    },

    downloadApplicationInvoice: async (id: string) => {
        const response = await api.get(`/admissions/applications/${id}/download_invoice/`, { responseType: 'blob' });
        return response.data;
    }
};
