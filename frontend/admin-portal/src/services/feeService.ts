
import api from './api';

export interface FeeGroup {
    id: string;
    school: string;
    name: string;
    description?: string;
}

export interface FeeType {
    id: string;
    school: string;
    name: string;
    description?: string;
}

export interface FeeMaster {
    id: string;
    school: string;
    fee_group: string;
    fee_group_name?: string;
    fee_type: string;
    fee_type_name?: string;
    amount: string;
    due_date: string;
    fine_type: 'NONE' | 'FIXED' | 'PERCENTAGE';
    fine_amount: string;
}

export interface FeeAllocation {
    id: string;
    school: string;
    student: string;
    student_name?: string;
    fee_master: string;
    fee_type_name?: string;
    due_date?: string;
    amount: string;
    paid_amount: string;
    remaining_amount?: string;
    status: 'UNPAID' | 'PARTIAL' | 'PAID';
}

export interface FeePayment {
    id: string;
    school: string;
    allocation: string;
    amount_paid: string;
    payment_date: string;
    payment_mode: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
    reference_number?: string;
    notes?: string;
}

export const feeService = {
    // Fee Groups
    getGroups: async (params?: any) => {
        const response = await api.get('/fees/groups/', { params });
        return response.data;
    },
    createGroup: async (data: any) => {
        const response = await api.post('/fees/groups/', data);
        return response.data;
    },

    // Fee Types
    getTypes: async (params?: any) => {
        const response = await api.get('/fees/types/', { params });
        return response.data;
    },
    createType: async (data: any) => {
        const response = await api.post('/fees/types/', data);
        return response.data;
    },

    // Fee Masters
    getMasters: async (params?: any) => {
        const response = await api.get('/fees/masters/', { params });
        return response.data;
    },
    createMaster: async (data: any) => {
        const response = await api.post('/fees/masters/', data);
        return response.data;
    },

    // Fee Allocations
    getAllocations: async (params?: any) => {
        const response = await api.get('/fees/allocations/', { params });
        return response.data;
    },
    createAllocation: async (data: any) => {
        const response = await api.post('/fees/allocations/', data);
        return response.data;
    },

    // Fee Payments
    getPayments: async (params?: any) => {
        const response = await api.get('/fees/payments/', { params });
        return response.data;
    },
    collectPayment: async (data: {
        allocation: string;
        amount_paid: number | string;
        payment_mode: string;
        reference_number?: string;
        notes?: string;
    }) => {
        const response = await api.post('/fees/payments/', data);
        return response.data;
    }
};
