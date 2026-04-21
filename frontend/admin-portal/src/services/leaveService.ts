import api from './api';

export interface LeaveType {
    id: string;
    school: string;
    name: string;
    description: string;
    is_paid: boolean;
    days_allowed: number;
}

export interface LeaveApplication {
    id: string;
    school: string;
    applicant: string;
    applicant_name: string;
    leave_type: string;
    leave_type_name: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approved_by: string | null;
    approver_name: string | null;
    rejection_reason: string;
    created_at: string;
    duration: number;
}

export interface CreateLeaveApplicationPayload {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
}

export const leaveService = {
    // Leave Types
    getLeaveTypes: async (params?: any) => {
        const response = await api.get('/attendance/leave-types/', { params });
        return response.data;
    },

    createLeaveType: async (data: Partial<LeaveType>) => {
        const response = await api.post('/attendance/leave-types/', data);
        return response.data;
    },

    updateLeaveType: async (id: string, data: Partial<LeaveType>) => {
        const response = await api.patch(`/attendance/leave-types/${id}/`, data);
        return response.data;
    },

    deleteLeaveType: async (id: string) => {
        await api.delete(`/attendance/leave-types/${id}/`);
    },

    // Leave Applications
    getLeaveApplications: async (params?: any) => {
        const response = await api.get('/attendance/leaves/', { params });
        return response.data;
    },

    createLeaveApplication: async (data: CreateLeaveApplicationPayload) => {
        const response = await api.post('/attendance/leaves/', data);
        return response.data;
    },

    approveLeave: async (id: string) => {
        const response = await api.post(`/attendance/leaves/${id}/approve/`);
        return response.data;
    },

    rejectLeave: async (id: string, rejection_reason: string) => {
        const response = await api.post(`/attendance/leaves/${id}/reject/`, { rejection_reason });
        return response.data;
    },

    deleteLeaveApplication: async (id: string) => {
        await api.delete(`/attendance/leaves/${id}/`);
    },
};
