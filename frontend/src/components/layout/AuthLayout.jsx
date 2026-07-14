import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

export default function AuthLayout({ title, subtitle, children, icon: Icon }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <div className="min-h-screen bg-slate-950 light:bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-lg text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-colors duration-200"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 dark:bg-brand-600/10 light:bg-brand-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/10 light:bg-indigo-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-600/10 dark:bg-emerald-600/5 light:bg-emerald-600/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 dark:bg-brand-600/20 light:bg-brand-600/10 border border-brand-500/30 dark:border-brand-500/30 light:border-brand-500/50 mb-4 shadow-lg shadow-brand-600/20">
            {Icon ? (
              <Icon className="w-8 h-8 text-brand-400 dark:text-brand-400 light:text-brand-600" />
            ) : (
              <img src="/logo.png" alt="CredenVault" className="w-10 h-10 object-contain" />
            )}
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-indigo-400 dark:from-brand-400 dark:to-indigo-400 light:from-brand-600 light:to-indigo-600 bg-clip-text text-transparent">
            CredenVault
          </h1>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-3 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card p-8 border border-slate-800/50 dark:border-slate-800/50 light:border-slate-300/50 relative group">
          {/* Card gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/0 to-transparent dark:group-hover:from-brand-600/5 light:group-hover:from-brand-600/3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative z-10">
            {title && (
              <h2 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-6">
                {title}
              </h2>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
