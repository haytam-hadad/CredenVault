import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Une erreur est survenue';

    // Endpoints that legitimately return 401 for a wrong *submitted* credential
    // (not an expired session). These must NOT trigger an auto-logout/redirect,
    // otherwise a wrong current password on the change-password form would log
    // the user out instead of showing the error.
    const credentialCheckEndpoints = ['/auth/login', '/users/password', '/auth/2fa/disable', '/auth/verify-password'];
    const isCredentialCheck = credentialCheckEndpoints.some((path) =>
      error.config?.url?.includes(path)
    );

    if (error.response?.status === 401 && !isCredentialCheck) {
      sessionStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
