/**
 * User management service
 */

import api from './api';

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    school: any;
    school_name?: string;
}

export const userService = {
    /**
     * Get all users (Super Admin only)
     */
    getUsers: async (params?: { role?: string; school?: string; is_active?: boolean }) => {
        const response = await api.get('/auth/users/', { params });
        return response.data;
    },

    /**
     * Get a single user
     */
    getUser: async (id: string) => {
        const response = await api.get(`/auth/users/${id}/`);
        return response.data;
    },

    /**
     * Update a user
     */
    updateUser: async (id: string, data: Partial<User>) => {
        const response = await api.patch(`/auth/users/${id}/`, data);
        return response.data;
    },

    /**
     * Delete a user
     */
    deleteUser: async (id: string) => {
        const response = await api.delete(`/auth/users/${id}/`);
        return response.data;
    },

    /**
     * Reset user password (Admin only)
     */
    resetPassword: async (id: string, password: string) => {
        const response = await api.post(`/auth/users/${id}/reset-password/`, { password });
        return response.data;
    },
};
