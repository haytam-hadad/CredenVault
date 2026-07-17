import { Menu, Sun, Moon, Lock, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { useState, useEffect } from 'react';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [securityStatus, setSecurityStatus] = useState('secure');

  useEffect(() => {
    // Determine security status based on 2FA and other factors
    if (user?.twoFactorEnabled) {
      setSecurityStatus('secure');
    } else {
      setSecurityStatus('warning');
    }
  }, [user]);

  const getSecurityColor = () => {
    switch (securityStatus) {
      case 'secure':
        return 'text-emerald-400';
      case 'warning':
        return 'text-orange-400';
      default:
        return 'text-slate-400';
    }
  };

  const getSecurityIcon = () => {
    switch (securityStatus) {
      case 'secure':
        return <Lock className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 transition-colors duration-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CredenVault" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-slate-100 hidden sm:block">CredenVault</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                         ${securityStatus === 'secure' 
                           ? 'bg-emerald-600/20 text-emerald-300' 
                           : 'bg-orange-600/20 text-orange-300'}`}>
            {getSecurityIcon()}
            {securityStatus === 'secure' ? 'Sécurisé' : 'À améliorer'}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-100">
              {user?.firstName || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-600/60 border border-brand-500/30 flex items-center justify-center transition-colors">
            <span className="text-white font-semibold text-md">
              {(user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
