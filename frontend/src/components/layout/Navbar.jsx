import { Shield, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-brand-500" />
            <span className="text-xl font-bold text-white hidden sm:block">CredenVault</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">
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
