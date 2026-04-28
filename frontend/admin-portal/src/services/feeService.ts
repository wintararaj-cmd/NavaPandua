import api from './api';

export interface FeeGroup {
    id: string;
    name: string;
    description: string;
}

export interface FeeType {
    id: string;
    name: string;
    description: string;
}

export interface FeeMaster {
    id: string;
    fee_group: string;
    fee_type: string;
    target_class?: string;
    amount: string;
    due_date: string;
    fine_type: 'NONE' | 'FIXED' | 'PERCENTAGE';
    fine_amount: string;
    
    // Details for UI
    fee_group_name?: string;
    fee_type_name?: string;
    class_name?: string;
}

export interface FeeAllocation {
    id: string;
    student: string;
    student_name?: string;
    fee_master: string;
    amount: string;
    paid_amount: string;
    status: 'UNPAID' | 'PARTIAL' | 'PAID';
    due_date: string;
    remaining_amount: number;
}

export interface FeePayment {
    id: string;
    allocation: string;
    amount_paid: string;
    payment_date: string;
    payment_mode: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
    reference_number?: string;
    notes?: string;
}

export const feeService = {
    // Master Data
    getFeeGroups: async () => {
        const response = await api.get('/fees/groups/');
        return response.data;
    },
    createFeeGroup: async (data: Partial<FeeGroup>) => {
        const response = await api.post('/fees/groups/', data);
        return response.data;
    },

    getFeeTypes: async () => {
        const response = await api.get('/fees/types/');
        return response.data;
    },
    createFeeType: async (data: Partial<FeeType>) => {
        const response = await api.post('/fees/types/', data);
        return response.data;
    },

    // Fee Masters
    getFeeMasters: async (params?: any) => {
        const response = await api.get('/fees/masters/', { params });
        return response.data;
    },
    createFeeMaster: async (data: Partial<FeeMaster>) => {
        const response = await api.post('/fees/masters/', data);
        return response.data;
    },

    // Allocations
    getAllocations: async (params?: any) => {
        const response = await api.get('/fees/allocations/', { params });
        return response.data;
    },
    allocateFees: async (data: { student_ids: string[], fee_master_ids: string[] }) => {
        const response = await api.post('/fees/allocations/bulk_allocate/', data);
        return response.data;
    },
    bulkAllocate: async (masterId: string, classId?: string) => {
        const response = await api.post(`/fees/masters/${masterId}/bulk-allocate/`, { class_id: classId });
        return response.data;
    },
    getStudentLedger: async (studentId: string) => {
        const response = await api.get('/fees/allocations/student-ledger/', { params: { student_id: studentId } });
        return response.data;
    },

    // Payments
    getPayments: async (params?: any) => {
        const response = await api.get('/fees/payments/', { params });
        return response.data;
    },
    collectFee: async (data: Partial<FeePayment>) => {
        const response = await api.post('/fees/payments/', data);
        return response.data;
    },
    downloadReceipt: async (paymentId: string) => {
        const response = await api.get(`/fees/payments/${paymentId}/receipt/`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getFeeSummary: async () => {
        const response = await api.get('/fees/allocations/summary/');
        return response.data;
    },
    getPendingStudents: async () => {
        const response = await api.get('/fees/allocations/pending-students/');
        return response.data;
    }
};


