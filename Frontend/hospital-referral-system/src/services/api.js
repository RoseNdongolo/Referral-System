// api.js
import axios from 'axios';

// ==============================
//  Axios instance configuration
// ==============================
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // optional: 10s timeout
});

// ==============================
//  Public endpoints – no token required
// ==============================
const PUBLIC_ENDPOINTS = [
  '/accounts/login/',
  '/accounts/register/',
  '/accounts/token/refresh/',
  '/accounts/password-reset/',
  // add any other public routes here
];

// Helper to check if a request targets a public endpoint
const isPublicEndpoint = (url) => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// ==============================
//  Request interceptor
// ==============================
api.interceptors.request.use(
  (config) => {
    // Skip token attachment for public endpoints
    if (isPublicEndpoint(config.url)) {
      console.debug(`🔓 ${config.method?.toUpperCase()} ${config.url} – public endpoint, no token attached`);
      return config;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(`🔒 ${config.method?.toUpperCase()} ${config.url} – token attached`);
    } else {
      // Only warn for non‑public endpoints that actually need a token
      console.warn(`⚠️ ${config.method?.toUpperCase()} ${config.url} – missing token (authenticated endpoint)`);
      // Optional: reject the request to prevent sending without token
      // return Promise.reject(new Error('Authentication required'));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
//  Response interceptor (optional – for token refresh)
// ==============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/accounts/token/refresh/`,
            { refresh: refreshToken }
          );
          localStorage.setItem('accessToken', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;