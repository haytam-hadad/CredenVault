/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
      brand: {
        50: '#f5f7ff',
        100: '#e9edfc',
        200: '#d5ddfa',
        300: '#b4c2f7',
        400: '#8ba0f2',
        500: '#637bed',
        600: '#455ee3',
        700: '#3549cc',
        800: '#2d3ca6',
        900: '#1e2766',
      },
      // The slate palette is backed by CSS variables so the entire UI can be
      // themed (dark <-> light) without editing individual class names.
      // The default (dark) values and the `.light` values are defined in
      // index.css. Using `rgb(var(--x) / <alpha-value>)` keeps opacity
      // utilities like `bg-slate-900/60` working.
      slate: {
        50: 'rgb(var(--slate-50) / <alpha-value>)',
        100: 'rgb(var(--slate-100) / <alpha-value>)',
        200: 'rgb(var(--slate-200) / <alpha-value>)',
        300: 'rgb(var(--slate-300) / <alpha-value>)',
        400: 'rgb(var(--slate-400) / <alpha-value>)',
        500: 'rgb(var(--slate-500) / <alpha-value>)',
        600: 'rgb(var(--slate-600) / <alpha-value>)',
        700: 'rgb(var(--slate-700) / <alpha-value>)',
        800: 'rgb(var(--slate-800) / <alpha-value>)',
        900: 'rgb(var(--slate-900) / <alpha-value>)',
        950: 'rgb(var(--slate-950) / <alpha-value>)',
      },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
