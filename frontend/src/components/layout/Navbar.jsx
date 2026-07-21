import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Lock, ChevronDown, LogOut, Loader2, Settings, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import useNotificationStore from '../../store/notificationStore';
import { securityService } from '../../services';
import { formatDate } from '../../utils/helpers';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const fetchRecent = useNotificationStore((s) => s.fetchRecent);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // 2FA is currently the only signal we have for "secure". Extend this
  // once breach/reuse checks are wired up.
  const isSecure = Boolean(user?.twoFactorEnabled);

  // Close the user menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Close the notifications dropdown on outside click or Escape.
  useEffect(() => {
    if (!notifOpen) return undefined;

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen]);

  const toggleNotifications = () => {
    setNotifOpen((v) => {
      if (!v) fetchRecent();
      return !v;
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await securityService.markAllNotificationsRead();
      await Promise.all([fetchUnreadCount(), fetchRecent()]);
    } catch {
      // handled by interceptor
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Voulez-vous vraiment vous déconnecter ?');
    if (!confirmed || isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Échec de la déconnexion :', error);
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.firstName || user?.email?.split('@')[0];
  const initial = (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 transition-colors duration-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
            className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo CredenVault" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-slate-100 hidden sm:block">CredenVault</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSecure && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300">
              <Lock className="w-4 h-4" aria-hidden="true" />
              Sécurisé
            </div>
          )}

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              aria-label="Notifications"
              title="Notifications"
              className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/30 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
                  <p className="text-sm font-semibold text-slate-100">Rappels &amp; alertes</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-slate-500">
                      Aucune notification non lue
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif._id}
                        className="flex items-start gap-2 px-3 py-2.5 border-b border-slate-800/60 last:border-b-0"
                      >
                        <span className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-brand-500" />
                        <div className="min-w-0">
                          {notif.metadata?.serviceName && (
                            <p className="text-xs font-medium text-slate-300 truncate">
                              {notif.metadata.serviceName}
                            </p>
                          )}
                          <p className="text-sm text-slate-200 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {formatDate(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/notifications"
                  role="menuitem"
                  onClick={() => setNotifOpen(false)}
                  className="block px-3 py-2.5 text-center text-sm font-medium text-brand-400 hover:text-brand-300 hover:bg-slate-800 border-t border-slate-800 transition-colors"
                >
                  Voir tout
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-brand-600/60 border border-brand-500/30 flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-md">{initial}</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-slate-100 leading-tight">{displayName}</p>
                <p className="text-xs text-slate-500 leading-tight">{user?.email}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform hidden sm:block ${
                  menuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/30 py-1.5 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-slate-800 sm:hidden">
                  <p className="text-sm font-medium text-slate-100">{displayName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  Paramètres
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="w-4 h-4 text-red-500" aria-hidden="true" />
                  )}
                  {isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}