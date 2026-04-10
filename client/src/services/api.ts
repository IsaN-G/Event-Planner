// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const res = await api.post('/auth/refresh');
        const { accessToken, user: refreshedUser } = res.data;

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      
        if (refreshedUser) {
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }

        return api(originalRequest);
      } catch (refreshError) {
        console.log('Refresh Token ungültig → Logout');
        localStorage.removeItem('user');
        delete api.defaults.headers.common.Authorization;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;