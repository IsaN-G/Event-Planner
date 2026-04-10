import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // WICHTIG: Nur der Pfad, keine URL!
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        // Hier wird automatisch an /api/auth/refresh gesendet
        const res = await api.post('/auth/refresh'); 
        const { accessToken } = res.data;
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;