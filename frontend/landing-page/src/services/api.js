
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

export const schoolService = {
    getPublicPage: async (schoolCode) => {
        const response = await api.get(`/schools/${schoolCode}/public-page/`);
        return response.data;
    }
};

export default api;
