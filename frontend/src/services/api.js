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

export const patchUser = (userId, data) => api.patch(`/api/users/${userId}/`, data);

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
export const getDreams = (tab = 'following', communityId = null) => {
    let url = `/api/dreams/?tab=${tab}`;
    if (communityId) {
        url += `&community_id=${communityId}`;
    }
    return api.get(url);
};

export const getMyDreams = () => api.get('/api/dreams/?tab=mine');

export const createDream = (data) => api.post('/api/dreams/', data);

export const getDream = (id) => api.get(`/api/dreams/${id}/`);

export const updateDream = (id, data) => api.put(`/api/dreams/${id}/`, data);

export const deleteDream = (id) => api.delete(`/api/dreams/${id}/`);

export const likeDream = (id) => api.post(`/api/dreams/${id}/like/`);

export const saveDream = (id) => api.post(`/api/dreams/${id}/save/`);

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

export const search = (query, type = 'all', limit = 20) => api.get(`/api/search/?q=${query}&type=${type}&limit=${limit}`);

// Settings endpoints
export const getUserSettings = () => api.get('/api/settings/');

export const updateUserSettings = (data) => api.patch('/api/settings/', data);

// Close Friends endpoints
export const getCloseFriendsManage = () => api.get('/api/friends/manage/');

export const toggleCloseFriend = (userId) => api.post(`/api/friends/toggle/${userId}/`);

// Follow Requests endpoints
export const getFollowRequests = () => api.get('/api/follow-requests/');

export const acceptFollowRequest = (userId) => api.post(`/api/follow-requests/${userId}/action/`, { action: 'accept' });


export const rejectFollowRequest = (userId) => api.post(`/api/follow-requests/${userId}/action/`, { action: 'reject' });

// Community endpoints
export const getCommunities = () => api.get('/api/communities/');
export const createCommunity = (data) => api.post('/api/communities/', data);
export const getCommunity = (id) => api.get(`/api/communities/${id}/`);
export const joinCommunity = (id) => api.post(`/api/communities/${id}/join/`);

export default api;



