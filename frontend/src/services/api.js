import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Guard: collapse concurrent 401s into a single redirect
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('token');

      // Reset flag after navigation completes so a fresh login session works
      setTimeout(() => { isRedirecting = false; }, 3000);

      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
