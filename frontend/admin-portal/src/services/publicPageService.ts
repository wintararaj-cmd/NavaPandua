
import api from './api';

export interface GalleryImage {
    id: string;
    image: string;
    caption: string;
    order: number;
}

export interface SchoolPublicPage {
    id: string;
    school: string;
    primary_color: string;
    secondary_color: string;
    vision: string;
    mission: string;
    about_text: string;
    is_published: boolean;
    gallery_images: GalleryImage[];
    school_name?: string;
    school_logo?: string;
    school_address?: string;
    school_email?: string;
    school_phone?: string;
    school_code?: string;
}

export const publicPageService = {
    getPublicPage: async (schoolId: string) => {
        const response = await api.get(`/schools/${schoolId}/public-page/`);
        return response.data;
    },

    updatePublicPage: async (schoolId: string, data: Partial<SchoolPublicPage>) => {
        const response = await api.patch(`/schools/${schoolId}/public-page/`, data);
        return response.data;
    },

    getGalleryImages: async (schoolId: string) => {
        const response = await api.get(`/schools/${schoolId}/gallery/`);
        return response.data;
    },

    uploadGalleryImage: async (schoolId: string, formData: FormData) => {
        const response = await api.post(`/schools/${schoolId}/gallery/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteGalleryImage: async (schoolId: string, imageId: string) => {
        const response = await api.delete(`/schools/${schoolId}/gallery/${imageId}/`);
        return response.data;
    },

    updateSchoolIdentity: async (schoolId: string, formData: FormData) => {
        const response = await api.patch(`/schools/${schoolId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
