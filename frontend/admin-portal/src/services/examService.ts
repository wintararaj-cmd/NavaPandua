
import api from './api';

export interface ExamGrade {
    id: string;
    school: string;
    name: string;
    percent_from: string;
    percent_upto: string;
    grade_point: string;
    description?: string;
}

export interface Exam {
    id: string;
    school: string;
    name: string;
    description?: string;
    is_active: boolean;
}

export interface ExamSchedule {
    id: string;
    school: string;
    exam: string;
    exam_name?: string;
    subject: string;
    subject_name?: string;
    date: string;
    start_time: string;
    duration_minutes: number;
    room_number?: string;
    full_marks: string;
    passing_marks: string;
}

export interface ExamResult {
    id: string;
    school: string;
    exam_schedule: string;
    subject_name?: string;
    student: string;
    student_name?: string;
    marks_obtained: string;
    grade?: string;
    grade_name?: string;
    remarks?: string;
    is_absent: boolean;
}

export const examService = {
    // Grades
    getGrades: async (params?: any) => {
        const response = await api.get('/exams/grades/', { params });
        return response.data;
    },
    createGrade: async (data: any) => {
        const response = await api.post('/exams/grades/', data);
        return response.data;
    },

    // Exams
    getExams: async (params?: any) => {
        const response = await api.get('/exams/list/', { params });
        return response.data;
    },
    createExam: async (data: any) => {
        const response = await api.post('/exams/list/', data);
        return response.data;
    },

    // Schedules
    getSchedules: async (params?: any) => {
        const response = await api.get('/exams/schedules/', { params });
        return response.data;
    },
    createSchedule: async (data: any) => {
        const response = await api.post('/exams/schedules/', data);
        return response.data;
    },

    // Results
    getResults: async (params?: any) => {
        const response = await api.get('/exams/results/', { params });
        return response.data;
    },
    saveResult: async (data: any) => {
        const response = await api.post('/exams/results/', data);
        return response.data;
    },
    bulkSaveResults: async (results: any[]) => {
        // Implement bulk save if backend supports it, otherwise loop
        const promises = results.map(res => api.post('/exams/results/', res));
        return Promise.all(promises);
    }
};
