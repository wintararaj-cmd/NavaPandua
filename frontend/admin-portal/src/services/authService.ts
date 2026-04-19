/**
 * Authentication service
 */

import api from './api';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export const authService = {
    /**
     * Login user
     */
    login: async (credentials: LoginCredentials) => {
        const response = await api.post('/auth/login/', credentials);
        return response.data;
    },

    /**
     * Register new user
     */
    register: async (data: RegisterData) => {
        const response = await api.post('/auth/register/', data);
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async (refreshToken: string) => {
        const response = await api.post('/auth/logout/', { refresh_token: refreshToken });
        return response.data;
    },

    /**
     * Get current user
     */
    getCurrentUser: async () => {
        const response = await api.get('/auth/me/');
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: any) => {
        const response = await api.put('/auth/profile/', data);
        return response.data;
    },

    /**
     * Change password
     */
    changePassword: async (data: {
        old_password: string;
        new_password: string;
        new_password_confirm: string;
    }) => {
        const response = await api.post('/auth/change-password/', data);
        return response.data;
    },

    /**
     * Forgot password
     */
    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password/', { email });
        return response.data;
    },

    /**
     * Reset password
     */
    resetPassword: async (data: {
        token: string;
        new_password: string;
        new_password_confirm: string;
    }) => {
        const response = await api.post('/auth/reset-password/', data);
        return response.data;
    },

    /**
     * Verify email
     */
    verifyEmail: async (token: string) => {
        const response = await api.post('/auth/verify-email/', { token });
        return response.data;
    },

    /**
     * Resend verification email
     */
    resendVerification: async () => {
        const response = await api.post('/auth/resend-verification/');
        return response.data;
    },

    /**
     * Switch active school
     */
    switchSchool: async (schoolId: string) => {
        const response = await api.post('/auth/switch-school/', { school_id: schoolId });
        return response.data;
    },
};
