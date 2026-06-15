import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const saved = localStorage.getItem('foxin_auth');
    if (saved) {
      try {
        const { token } = JSON.parse(saved);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        /* ignore */
      }
    }
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('[API Error]', message);
    throw new Error(message);
  }
);

export default api;
