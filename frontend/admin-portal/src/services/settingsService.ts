import api from './api';

export interface SchoolSettings {
    school: string;
    // ID Card Settings
    application_id_prefix: string;
    student_id_prefix: string;
    teacher_id_prefix: string;
    id_number_length: number;
    
    // SMS/Communication Settings
    enable_sms: boolean;
    sms_api_key?: string;
    sms_sender_id?: string;
    send_admission_sms: boolean;
    send_fee_receipt_sms: boolean;
    send_absent_sms: boolean;
    send_exam_result_sms: boolean;
    
    // ERP Specific Settings
    policy_percentage: number;
    transaction_date?: string;
    close_for_admission: boolean;
    close_for_advance: boolean;
    close_for_working: boolean;
    
    [key: string]: any;
}

export const settingsService = {
    getSettings: async (schoolId: string) => {
        const response = await api.get(`/schools/${schoolId}/settings/`);
        return response.data;
    },

    updateSettings: async (schoolId: string, data: Partial<SchoolSettings>) => {
        const response = await api.patch(`/schools/${schoolId}/settings/`, data);
        return response.data;
    }
};
