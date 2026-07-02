import { create } from 'zustand';
import { authService } from '../services';

const useAuthStore = create((set, get) => ({
  user: null,
  token: sessionStorage.getItem('token'),
  isAuthenticated: !!sessionStorage.getItem('token'),
  isLoading: false,
  requires2FA: false,
  pendingEmail: null,

  setAuth: (user, token) => {
    if (token) sessionStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, requires2FA: false, pendingEmail: null });
  },

  clearAuth: () => {
    sessionStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, requires2FA: false, pendingEmail: null });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(credentials);
      if (res.requires2FA) {
        set({ requires2FA: true, pendingEmail: credentials.email, isLoading: false });
        return res;
      }
      get().setAuth(res.data.user, res.data.token);
      set({ isLoading: false });
      return res;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(data);
      get().setAuth(res.data.user, res.data.token);
      set({ isLoading: false });
      return res;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // clear local state even if API fails
    }
    get().clearAuth();
  },

  fetchUser: async () => {
    try {
      const res = await authService.getMe();
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    } catch {
      get().clearAuth();
      return null;
    }
  },

  updateUser: (user) => set({ user }),
}));

export default useAuthStore;
