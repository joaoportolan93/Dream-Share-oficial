import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

// Add auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem('refresh');
                if (refresh) {
                    const response = await axios.post('http://127.0.0.1:8000/api/auth/refresh/', {
                        refresh: refresh
                    });
                    localStorage.setItem('access', response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const logout = async () => {
    const refresh = localStorage.getItem('refresh');
    try {
        await api.post('/api/auth/logout/', { refresh });
    } finally {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
    }
};

// Profile endpoints
export const getProfile = () => api.get('/api/profile/');

export const getUser = (userId) => api.get(`/api/users/${userId}/`);

export const updateUser = (userId, data) => api.put(`/api/users/${userId}/`, data);

export const uploadAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/api/users/avatar/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// Dreams (Publicacao) endpoints
export const getDreams = (tab = 'following') => api.get(`/api/dreams/?tab=${tab}`);

export const createDream = (data) => api.post('/api/dreams/', data);

export const getDream = (id) => api.get(`/api/dreams/${id}/`);

export const updateDream = (id, data) => api.put(`/api/dreams/${id}/`, data);

export const deleteDream = (id) => api.delete(`/api/dreams/${id}/`);

export const likeDream = (id) => api.post(`/api/dreams/${id}/like/`);

// Follow endpoints
export const followUser = (userId) => api.post(`/api/users/${userId}/follow/`);

export const unfollowUser = (userId) => api.delete(`/api/users/${userId}/follow/`);

export const getSuggestedUsers = () => api.get('/api/users/suggested/');

// Comments endpoints
export const getComments = (dreamId) => api.get(`/api/dreams/${dreamId}/comments/`);

export const createComment = (dreamId, text) => api.post(`/api/dreams/${dreamId}/comments/`, { conteudo_texto: text });

export const deleteComment = (dreamId, commentId) => api.delete(`/api/dreams/${dreamId}/comments/${commentId}/`);

// Notifications endpoints
export const getNotifications = () => api.get('/api/notifications/');

export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}/read/`);

export const markAllNotificationsRead = () => api.patch('/api/notifications/read_all/');

export default api;


