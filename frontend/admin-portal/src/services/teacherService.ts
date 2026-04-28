import api from './api';

export interface Staff {
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

export interface StaffFormData {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    password?: string;
    gender?: string;
    date_of_birth?: string;
    role: string;
    employee_id: string;
    department: string;
    designation: string;
    qualification: string;
    joining_date: string;
    current_address?: string;
    basic_salary?: number;
    bank_account_no?: string;
    ifsc_code?: string;
    bank_name?: string;
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

    create: async (data: StaffFormData) => {
        const response = await api.post('/teachers/', data);
        return response.data;
    },

    update: async (id: number, data: Partial<StaffFormData>) => {
        const response = await api.patch(`/teachers/${id}/`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/teachers/${id}/`);
    },


    importTeachers: async (formData: FormData) => {
        const response = await api.post('/teachers/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    toggleStatus: async (id: number) => {
        const response = await api.post(`/teachers/${id}/toggle_status/`);
        return response.data;
    }
};


