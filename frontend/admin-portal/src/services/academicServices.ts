import api from './api';

export const timetableService = {
    getPeriods: async () => {
        const response = await api.get('/timetables/periods/');
        return response.data;
    },
    getEntries: async (params?: any) => {
        const response = await api.get('/timetables/entries/', { params });
        return response.data;
    },
    createEntry: async (data: any) => {
        const response = await api.post('/timetables/entries/', data);
        return response.data;
    }
};

export const libraryService = {
    getBooks: async (params?: any) => {
        const response = await api.get('/library/books/', { params });
        return response.data;
    },
    getBorrowings: async (params?: any) => {
        const response = await api.get('/library/borrowings/', { params });
        return response.data;
    },
    createBook: async (data: any) => {
        const response = await api.post('/library/books/', data);
        return response.data;
    },
    updateBook: async (id: string, data: any) => {
        const response = await api.patch(`/library/books/${id}/`, data);
        return response.data;
    },
    deleteBook: async (id: string) => {
        await api.delete(`/library/books/${id}/`);
    },
    issueBook: async (data: any) => {
        const response = await api.post('/library/borrowings/', data);
        return response.data;
    },
    returnBook: async (id: string) => {
        const response = await api.post(`/library/borrowings/${id}/return/`);
        return response.data;
    }
};

export const liveClassService = {
    getLiveClasses: async (params?: any) => {
        const response = await api.get('/live-classes/', { params });
        return response.data;
    },
    createLiveClass: async (data: any) => {
        const response = await api.post('/live-classes/', data);
        return response.data;
    },
    updateLiveClass: async (id: string, data: any) => {
        const response = await api.patch(`/live-classes/${id}/`, data);
        return response.data;
    },
    deleteLiveClass: async (id: string) => {
        await api.delete(`/live-classes/${id}/`);
    }
};
