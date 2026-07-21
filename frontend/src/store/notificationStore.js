import { create } from 'zustand';
import { securityService } from '../services';
import useAuthStore from './authStore';

const POLL_INTERVAL = 30000;

const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  notifications: [],
  pollIntervalId: null,

  fetchUnreadCount: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    try {
      const res = await securityService.getUnreadCount();
      set({ unreadCount: res.data.count });
    } catch {
      // silently ignore; interceptor handles auth errors
    }
  },

  fetchRecent: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    try {
      const res = await securityService.getNotifications({ status: 'unread' });
      set({ notifications: res.data.notifications || [] });
    } catch {
      // silently ignore
    }
  },

  startPolling: () => {
    if (get().pollIntervalId) return;
    get().fetchUnreadCount();
    const id = setInterval(() => {
      get().fetchUnreadCount();
    }, POLL_INTERVAL);
    set({ pollIntervalId: id });
  },

  stopPolling: () => {
    const id = get().pollIntervalId;
    if (id) clearInterval(id);
    set({ pollIntervalId: null });
  },

  reset: () => {
    get().stopPolling();
    set({ unreadCount: 0, notifications: [] });
  },
}));

export default useNotificationStore;