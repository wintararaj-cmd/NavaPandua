
import api from './api';

export interface DashboardStats {
    total_students: number;
    total_teachers: number;
    total_schools: number;
    total_organizations: number;
    attendance_today: {
        present: number;
        absent: number;
        late: number;
        total_marked: number;
        percentage: number;
    };
    attendance_trend: Array<{
        date: string;
        present: number;
        absent: number;
    }>;
    finance: {
        monthly_collection: number;
        currency: string;
    };
}

export const analyticsService = {
    /**
     * Get dashboard statistics
     */
    getDashboardStats: async () => {
        const response = await api.get('/analytics/dashboard/stats/');
        return response.data;
    },
    /**
     * Get performance statistics
     */
    getPerformanceStats: async (params?: any) => {
        const response = await api.get('/analytics/performance/', { params });
        return response.data;
    },
    /**
     * Download report
     */
    downloadReport: async (type: string, format: string) => {
        const response = await api.get('/analytics/reports/export/', {
            params: { type, format },
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        link.setAttribute('download', `${type}_report.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
