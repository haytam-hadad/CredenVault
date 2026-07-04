import { Menu, Sun, Moon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CredenVault" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-slate-100 hidden sm:block">CredenVault</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-100">
              {user?.firstName || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center">
            <span className="text-brand-300 font-semibold text-sm">
              {(user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
