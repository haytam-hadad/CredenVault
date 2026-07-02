import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  setup2FA: () => api.post('/auth/2fa/setup').then((r) => r.data),
  verify2FA: (token) => api.post('/auth/2fa/verify', { token }).then((r) => r.data),
  disable2FA: (data) => api.post('/auth/2fa/disable', data).then((r) => r.data),
};

export const userService = {
  getProfile: () => api.get('/users/profile').then((r) => r.data),
  updateProfile: (data) => api.put('/users/profile', data).then((r) => r.data),
  changePassword: (data) => api.put('/users/password', data).then((r) => r.data),
  getSecuritySettings: () => api.get('/users/security-settings').then((r) => r.data),
  updateSecuritySettings: (data) => api.put('/users/security-settings', data).then((r) => r.data),
};

export const accountService = {
  getAll: (params) => api.get('/accounts', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/accounts/${id}`).then((r) => r.data),
  create: (data) => api.post('/accounts', data).then((r) => r.data),
  update: (id, data) => api.put(`/accounts/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/accounts/${id}`).then((r) => r.data),
};

export const securityService = {
  checkStrength: (password) =>
    api.post('/security/password/check-strength', { password }).then((r) => r.data),
  generatePassword: (options) =>
    api.post('/security/password/generate', options).then((r) => r.data),
  getDashboard: () => api.get('/security/dashboard').then((r) => r.data),
  getNotifications: (params) => api.get('/security/notifications', { params }).then((r) => r.data),
  markNotificationRead: (id) =>
    api.patch(`/security/notifications/${id}/read`).then((r) => r.data),
  getLogs: () => api.get('/security/logs').then((r) => r.data),
  checkRenewals: () => api.post('/security/password-renewals/check').then((r) => r.data),
};
