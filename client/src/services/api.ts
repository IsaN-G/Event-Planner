import axios from 'axios';

// Wir nutzen nur noch '/api'. 
// Vercel weiß durch die vercel.json, dass alles mit /api zu Render geschickt werden muss.
const api = axios.create({
  baseURL: '/api', 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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