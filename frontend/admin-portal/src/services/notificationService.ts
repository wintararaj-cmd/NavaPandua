import api from './api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    notification_type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'ALERT';
    is_read: boolean;
    read_at?: string;
    link?: string;
    created_at: string;
}

export interface Announcement {
    id: string;
    school: string;
    title: string;
    content: string;
    target_audience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'CLASS';
    target_class?: string;
    target_class_name?: string;
    created_by: string;
    created_by_name?: string;
    is_active: boolean;
    expiry_date?: string;
    attachment?: string;
    created_at: string;
}

export interface AnnouncementFormData {
    title: string;
    content: string;
    target_audience: string;
    target_class?: string | null;
    expiry_date?: string | null;
    is_active: boolean;
}

export const notificationService = {
    // Individual Notifications
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

    // Announcements/Notices
    getAnnouncements: async (params?: any) => {
        const response = await api.get('/notifications/announcements/', { params });
        return response.data;
    },
    createAnnouncement: async (data: AnnouncementFormData) => {
        const response = await api.post('/notifications/announcements/', data);
        return response.data;
    },
    updateAnnouncement: async (id: string, data: Partial<AnnouncementFormData>) => {
        const response = await api.patch(`/notifications/announcements/${id}/`, data);
        return response.data;
    },
    deleteAnnouncement: async (id: string) => {
        const response = await api.delete(`/notifications/announcements/${id}/`);
        return response.data;
    }
};
