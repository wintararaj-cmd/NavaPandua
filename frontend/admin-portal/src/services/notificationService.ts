import api from './api';

export interface Notification {
    id: string;
    recipient: string;
    title: string;
    message: string;
    notification_type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'ALERT';
    is_read: boolean;
    read_at: string | null;
    link: string;
    created_at: string;
}

export const notificationService = {
    getNotifications: async (params?: any) => {
        const response = await api.get('/notifications/', { params });
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.post(`/notifications/${id}/read/`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.post('/notifications/read-all/');
        return response.data;
    },

    deleteNotification: async (id: string) => {
        await api.delete(`/notifications/${id}/`);
    }
};
