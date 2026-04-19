/**
 * Application configuration
 */

export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    appName: 'School Management System',
    appVersion: '1.0.0',

    // Pagination
    defaultPageSize: 20,
    maxPageSize: 100,

    // File upload
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

    // Date format
    dateFormat: 'MMM dd, yyyy',
    dateTimeFormat: 'MMM dd, yyyy HH:mm',

    // Local storage keys
    storageKeys: {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: 'user',
    },
};

export default config;
