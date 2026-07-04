import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KeyRound,
  Settings,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: KeyRound, label: 'Comptes' },
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
      <div className="flex items-center gap-2 px-4 py-6 border-b border-slate-800">
        <img src="/logo.png" alt="CredenVault" className="w-9 h-9 object-contain" />
        <div>
          <h1 className="text-lg font-bold text-slate-100">CredenVault</h1>
          <p className="text-xs text-slate-500">Gestion sécurisée</p>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden p-1 text-slate-400 hover:text-slate-100">
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
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
