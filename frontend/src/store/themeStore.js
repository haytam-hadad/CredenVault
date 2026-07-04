import { create } from 'zustand';

const STORAGE_KEY = 'credenvault-theme';

// Resolve the initial theme from localStorage, falling back to the OS
// preference, then to dark (the app's original default).
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

// Toggle the `.light` class on <html>. The dark theme is the absence of the
// class, matching the CSS variable defaults defined in index.css.
const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const useThemeStore = create((set, get) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

export default useThemeStore;
