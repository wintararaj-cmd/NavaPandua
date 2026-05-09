
import axios from 'axios';

// Get API URL from environment variables, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const schoolService = {
    getPublicPage: async (schoolCode) => {
        const response = await api.get(`/schools/${schoolCode}/public-page/`);
        return response.data;
    }
};

export default api;
