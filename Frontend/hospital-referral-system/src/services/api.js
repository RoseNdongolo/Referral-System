import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – adds token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ ${config.method?.toUpperCase()} ${config.url} - Token attached`);
    } else {
      console.warn(`❌ ${config.method?.toUpperCase()} ${config.url} - No token found!`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;