
import api from './api';

export interface Attendance {
    id: string;
    student?: string;
    student_name?: string;
    class_name?: string;
    section_name?: string;
    teacher?: string;
    teacher_name?: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'ON_LEAVE';
    remarks: string;
}

export interface BulkAttendancePayload {
    date: string;
    attendance_data: Array<{
        student: string;
        status: string;
        remarks?: string;
    }>;
}

export const attendanceService = {
    getStudentAttendance: async (params?: any) => {
        const response = await api.get('/attendance/students/', { params });
        return response.data;
    },

    getTeacherAttendance: async (params?: any) => {
        const response = await api.get('/attendance/teachers/', { params });
        return response.data;
    },

    bulkSaveStudentAttendance: async (data: BulkAttendancePayload) => {
        const response = await api.post('/attendance/students/bulk_save/', data);
        return response.data;
    },

    bulkSaveTeacherAttendance: async (data: any) => {
        const response = await api.post('/attendance/teachers/bulk-save/', data);
        return response.data;
    },


    updateAttendance: async (id: string, type: 'students' | 'teachers', data: Partial<Attendance>) => {
        const response = await api.patch(`/attendance/${type}/${id}/`, data);
        return response.data;
    },

    getMonthlyReport: async (year: number, month: number, classId: string) => {
        const response = await api.get('/attendance/students/monthly-report/', {
            params: { year, month, class_id: classId }
        });
        return response.data;
    }
};
