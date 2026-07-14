import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KeyRound,
  Settings,
  Bell,
  LogOut,
  X,
  Zap,
  Shield,
  Activity,
  Heart,
  Download,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: KeyRound, label: 'Comptes' },
  { to: '/favorites', icon: Heart, label: 'Favoris' },
  { to: '/password-generator', icon: Zap, label: 'Générateur' },
  { to: '/security-audit', icon: Shield, label: 'Audit Sécurité' },
  { to: '/activity-log', icon: Activity, label: 'Journal d\'Activité' },
  { to: '/data-management', icon: Download, label: 'Données' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
];

export default function Sidebar({ open, onClose }) {
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const navContent = (
    <>
      <div className="flex items-center gap-2 px-4 py-6 border-b border-slate-800 dark:border-slate-800 light:border-slate-300">
        <img src="/logo.png" alt="CredenVault" className="w-9 h-9 object-contain" />
        <div>
          <h1 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">CredenVault</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">Gestion sécurisée</p>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden p-1 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-slate-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/20 dark:bg-brand-600/20 light:bg-brand-600/10 text-brand-400 dark:text-brand-400 light:text-brand-700 border border-brand-500/20'
                  : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-800/50 light:hover:bg-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-300">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-red-400 dark:hover:text-red-400 light:hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/10 light:hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 light:bg-slate-900/20 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-r border-slate-800 dark:border-slate-800 light:border-slate-300 flex flex-col transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
