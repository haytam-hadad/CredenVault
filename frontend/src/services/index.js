// frontend/src/services/index.js  
import api from './api';  
  
export const authService = {  
  register: (data) => api.post('/auth/register', data),  
  login: (data) => api.post('/auth/login', data),  
  logout: () => api.post('/auth/logout'),  
  getMe: () => api.get('/auth/me'),  
  setup2FA: () => api.post('/auth/2fa/setup'),  
  verify2FA: (token) => api.post('/auth/2fa/verify', { token }),  
  disable2FA: (data) => api.post('/auth/2fa/disable', data),  
  regenerateRecoveryCodes: (password) =>  
    api.post('/auth/2fa/recovery-codes/regenerate', { password }),  
  verifyPassword: (password) =>  
    api.post('/auth/verify-password', { password }),  
};  
  
export const userService = {  
  getProfile: () => api.get('/users/profile'),  
  updateProfile: (data) => api.put('/users/profile', data),  
  changePassword: (data) => api.put('/users/password', data),  
  getSecuritySettings: () => api.get('/users/security-settings'),  
  updateSecuritySettings: (data) => api.put('/users/security-settings', data),  
};  
  
export const accountService = {  
  getAll: (params) => api.get('/accounts', { params }),  
  getOne: (id) => api.get(`/accounts/${id}`),  
  create: (data) => api.post('/accounts', data),  
  update: (id, data) => api.put(`/accounts/${id}`, data),  
  delete: (id) => api.delete(`/accounts/${id}`),  
  exportData: (password) => api.post('/accounts/export/all', { password }),  
  importData: (data) => api.post('/accounts/import/bulk', data),  
  getStats: () => api.get('/accounts/stats'),  
};  
  
export const securityService = {  
  checkStrength: (password) =>  
    api.post('/security/password/check-strength', { password }),  
  generatePassword: (options) =>  
    api.post('/security/password/generate', options),  
  getDashboard: () => api.get('/security/dashboard'),  
  getActivityLog: () => api.get('/security/logs'),  
  getNotifications: (params) => api.get('/security/notifications', { params }),  
  markNotificationRead: (id) =>  
    api.patch(`/security/notifications/${id}/read`),  
  deleteNotification: (id) => api.delete(`/security/notifications/${id}`),  
  checkRenewals: () => api.post('/security/password-renewals/check'),  
  getUnreadCount: () => api.get('/security/notifications/unread-count'),  
  markAllNotificationsRead: () => api.patch('/security/notifications/read-all'),  
  generateReminders: () => api.post('/security/notifications/generate'),  
};