import axios from 'axios';

// All data access goes through Next.js route handlers (which talk to
// Supabase server-side), so the API lives on the same origin.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Supabase access tokens expire after ~1h. When a stored token gets
// rejected, clear it and send the user back to login instead of leaving
// the app in a half-logged-in state where every action silently fails.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      localStorage.getItem('token')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
