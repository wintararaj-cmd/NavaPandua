import api from './api';

export interface Assignment {
    id: string;
    school: string;
    teacher: string;
    teacher_name: string;
    target_class: string;
    class_name: string;
    section: string | null;
    subject: string;
    subject_name: string;
    title: string;
    description: string;
    due_date: string;
    attachment: string | null;
    max_marks: number;
    created_at: string;
    submission_count?: number;
}

export interface AssignmentSubmission {
    id: string;
    assignment: string;
    assignment_title: string;
    student: string;
    student_name: string;
    submitted_file: string;
    remarks: string;
    marks_obtained: number | null;
    teacher_feedback: string;
    graded_at: string | null;
    created_at: string;
}

export interface CreateAssignmentPayload {
    target_class: string;
    section?: string;
    subject: string;
    title: string;
    description: string;
    due_date: string;
    max_marks: number;
    attachment?: File;
}

export interface GradeSubmissionPayload {
    marks_obtained: number;
    teacher_feedback: string;
}

export const assignmentService = {
    // Assignments
    getAssignments: async (params?: any) => {
        const response = await api.get('/assignments/', { params });
        return response.data;
    },

    getAssignment: async (id: string) => {
        const response = await api.get(`/assignments/${id}/`);
        return response.data;
    },

    createAssignment: async (data: CreateAssignmentPayload) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value as any);
            }
        });
        const response = await api.post('/assignments/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    updateAssignment: async (id: string, data: Partial<CreateAssignmentPayload>) => {
        const response = await api.patch(`/assignments/${id}/`, data);
        return response.data;
    },

    deleteAssignment: async (id: string) => {
        await api.delete(`/assignments/${id}/`);
    },

    // Submissions
    getSubmissions: async (params?: any) => {
        const response = await api.get('/assignments/submissions/', { params });
        return response.data;
    },

    getSubmissionsByAssignment: async (assignmentId: string) => {
        const response = await api.get('/assignments/submissions/', {
            params: { assignment: assignmentId },
        });
        return response.data;
    },

    gradeSubmission: async (submissionId: string, data: GradeSubmissionPayload) => {
        const response = await api.post(`/assignments/submissions/${submissionId}/grade/`, data);
        return response.data;
    },
};
