import { useEffect, useState } from 'react';  
import { NavLink } from 'react-router-dom';  
import {  
  LayoutDashboard,  
  KeyRound,  
  Settings,  
  Bell,  
  LogOut,  
  X,  
  Zap,  
  Activity,  
  Star,  
  Download,  
  Loader2,  
  Lock,  
} from 'lucide-react';  
import useAuthStore from '../../store/authStore';  
  
const links = [  
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },  
  { to: '/accounts', icon: KeyRound, label: 'Comptes' },  
  { to: '/favorites', icon: Star, label: 'Favoris' },  
  { to: '/password-generator', icon: Zap, label: 'Générateur' },  
  { to: '/notifications', icon: Bell, label: 'Notifications' },  
  { to: '/data-management', icon: Download, label: 'Données' },  
  { to: '/activity-log', icon: Activity, label: "Journal d'Activité" },  
  { to: '/settings', icon: Settings, label: 'Paramètres' },  
];  
  
export default function Sidebar({ open, onClose }) {  
  const logout = useAuthStore((s) => s.logout);  
  const [isLoggingOut, setIsLoggingOut] = useState(false);  
  
  // Close the mobile drawer on Escape, and keep body scroll locked while it's open.  
  useEffect(() => {  
    if (!open) return undefined;  
  
    const handleKeyDown = (event) => {  
      if (event.key === 'Escape') onClose();  
    };  
  
    document.addEventListener('keydown', handleKeyDown);  
    document.body.style.overflow = 'hidden';  
  
    return () => {  
      document.removeEventListener('keydown', handleKeyDown);  
      document.body.style.overflow = '';  
    };  
  }, [open, onClose]);  
  
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
  
  const navContent = (  
    <>  
      <header className="relative flex items-center gap-3 px-4 py-5 border-b border-slate-800">  
        {/* Logo with brand glow */}  
        <div className="relative shrink-0">  
          <div className="absolute inset-0 rounded-xl " aria-hidden="true" />  
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl ">  
            <img src="/logo.png" alt="Logo CredenVault" className="w-8 h-8 object-contain" />  
          </div>  
        </div>  
        <div className="min-w-0">  
          <h1 className="text-lg font-bold text-slate-100 tracking-tight truncate">CredenVault</h1>  
          <div className="flex items-center gap-1.5 mt-0.5">  
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">  
              <span className="motion-reduce:hidden absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />  
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />  
            </span>  
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500">  
              Session chiffrée  
            </p>  
          </div>  
        </div>  
        <button  
          type="button"  
          onClick={onClose}  
          aria-label="Fermer le menu"  
          className="ml-auto shrink-0 border border-slate-700 rounded-lg lg:hidden p-1 text-slate-400 hover:text-slate-100 hover:border-brand-500/50 transition-colors"  
        >  
          <X className="w-5 h-5" aria-hidden="true" />  
        </button>  
      </header>  
  
      <nav aria-label="Navigation principale" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">  
        {links.map(({ to, icon: Icon, label, end }) => (  
          <NavLink  
            key={to}  
            to={to}  
            end={end}  
            onClick={onClose}  
            className={({ isActive }) =>  
              `group relative flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 ${  
                isActive  
                  ? 'bg-brand-500/10 text-brand-400 border-brand-500 shadow-[inset_0_0_0_1px_rgb(99_123_237_/_0.15)]'  
                  : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-800/70 hover:border-slate-700'  
              }`  
            }  
          >  
            {({ isActive }) => (  
              <>  
                <Icon  
                  className={`w-5 h-5 shrink-0 transition-colors ${  
                    isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'  
                  }`}  
                  aria-hidden="true"  
                />  
                <span className="flex-1">{label}</span>  
                {isActive && (  
                  <Lock className="w-3.5 h-3.5 shrink-0 text-brand-500/70" aria-hidden="true" />  
                )}  
              </>  
            )}  
          </NavLink>  
        ))}  
      </nav>  
  
      <footer className="px-3 py-4 border-t border-slate-800">  
        <button  
          type="button"  
          onClick={handleLogout}  
          disabled={isLoggingOut}  
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"  
        >  
          {isLoggingOut ? (  
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />  
          ) : (  
            <LogOut className="w-5 h-5" aria-hidden="true" />  
          )}  
          {isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}  
        </button>  
      </footer>  
    </>  
  );  
  
  return (  
    <>  
      {/* Mobile overlay with blur + fade */}  
      <div  
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${  
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'  
        }`}  
        onClick={onClose}  
        aria-hidden="true"  
      />  
  
      <aside  
        aria-label="Barre latérale"  
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 shadow-[inset_-1px_0_0_0_rgb(99_123_237_/_0.08)] flex flex-col transform transition-transform duration-300 ease-out lg:translate-x-0 ${  
          open ? 'translate-x-0' : '-translate-x-full'  
        }`}  
      >  
        {navContent}  
      </aside>  
    </>  
  );  
}