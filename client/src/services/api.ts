import axios from 'axios';

// WICHTIG: baseURL leer lassen oder nur '/' nutzen, 
// da die vercel.json das /api bereits als "Source" erkennt.
const api = axios.create({
  baseURL: 'https://event-planner-backend-m16o.onrender.com/api',
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const res = await api.post('/auth/refresh', {}, { withCredentials: true }); // ← api statt axios
        const newToken = res.data.accessToken;

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

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