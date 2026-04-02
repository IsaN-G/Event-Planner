import axios from 'axios';

// WICHTIG: baseURL leer lassen oder nur '/' nutzen, 
// da die vercel.json das /api bereits als "Source" erkennt.
const api = axios.create({
  baseURL: '', 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Wir stellen sicher, dass jeder Request mit /api beginnt, 
  // damit die vercel.json greift.
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;