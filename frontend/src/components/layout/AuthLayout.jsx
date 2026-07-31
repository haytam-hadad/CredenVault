import { Sun, Moon, ShieldCheck, KeyRound, Lock } from 'lucide-react';  
import useThemeStore from '../../store/themeStore';  
  
const FEATURES = [  
  { icon: ShieldCheck, text: 'Chiffrement AES-256 de bout en bout' },  
  { icon: KeyRound, text: 'Authentification à deux facteurs (2FA)' },  
  { icon: Lock, text: 'Codes de récupération à usage unique' },  
];  
  
export default function AuthLayout({ title, subtitle, children, icon: Icon }) {  
  const theme = useThemeStore((s) => s.theme);  
  const toggleTheme = useThemeStore((s) => s.toggleTheme);  
  
  // Theme-aware grid: brighter brand-blue lines on dark, deeper/denser blue on  
  // light so the pattern stays clearly visible in both modes.  
  const isLight = theme === 'light';  
  const gridLine = isLight ? 'rgb(69 94 227 / 0.55)' : 'rgb(139 160 242 / 0.65)';  
  const gridOpacity = isLight ? 0.22 : 0.20;  
  
  return (  
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">  
      {/* Theme Toggle */}  
      <button  
        onClick={toggleTheme}  
        className="absolute top-4 right-4 z-50 p-2 rounded-lg text-slate-400 bg-slate-900/60 border border-slate-800 hover:text-brand-500 hover:border-brand-500/50 transition-colors duration-200"  
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}  
        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}  
      >  
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}  
      </button>  
  
      {/* ── LEFT: brand panel (hidden on mobile) ── */}  
      <aside className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-brand-500/20 overflow-hidden">  
        {/* security grid — theme-aware color + opacity for visibility in both modes */}  
        <div  
          aria-hidden="true"  
          className="absolute inset-0 pointer-events-none"  
          style={{  
            opacity: gridOpacity,  
            backgroundImage:  
              `linear-gradient(to right, ${gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,  
            backgroundSize: '36px 36px',  
          }}  
        />  
        {/* radial fade so the grid reads strong at top-left and softens outward */}  
        <div  
          aria-hidden="true"  
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-slate-950/60"  
        />  
        {/* one soft glow, top-left */}  
        <div  
          aria-hidden="true"  
          className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none animate-pulse motion-reduce:animate-none"  
        />  
  
        {/* Logo */}  
        <div className="relative z-10 flex items-center gap-2.5 animate-fade-in">  
          <img src="/logo.png" alt="CredenVault" className="w-8 h-8 object-contain" />  
          <span className="text-lg font-bold text-slate-100 tracking-tight">CredenVault</span>  
        </div>  
  
        {/* Headline + features */}  
        <div className="relative z-10 max-w-md animate-slide-in-left">  
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-[1.15] text-slate-100">  
            Votre coffre-fort<br />numérique,{' '}  
            <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">  
              sécurisé  
            </span>  
          </h2>  
          <p className="text-slate-400 mt-3 text-sm leading-relaxed">  
            Stockez, générez et gérez tous vos mots de passe en un seul endroit chiffré.  
          </p>  
  
          <ul className="mt-8 space-y-3 animate-stagger">  
            {FEATURES.map(({ icon: FeatureIcon, text }) => (  
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">  
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/30 shrink-0">  
                  <FeatureIcon className="w-4 h-4 text-brand-400" aria-hidden="true" />  
                </span>  
                {text}  
              </li>  
            ))}  
          </ul>  
        </div>  
  
        {/* Footer */}  
        <p className="relative z-10 text-xs text-slate-600 animate-fade-in">  
          © {new Date().getFullYear()} CredenVault. Tous droits réservés.  
        </p>  
      </aside>  
  
      {/* ── RIGHT: form panel ── */}  
      <main className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 relative">  
        <div className="w-full max-w-md animate-slide-in-up">  
          {/* Header */}  
          <div className="text-center lg:text-left mb-6">  
            {/* Mobile-only logo */}  
            <div className="lg:hidden flex justify-center mb-4">  
              {Icon ? (  
                <Icon className="w-9 h-9 text-brand-500" aria-hidden="true" />  
              ) : (  
                <img src="/logo.png" alt="CredenVault" className="w-10 h-10 object-contain" />  
              )}  
            </div>  
  
            {/* secure-connection pill */}  
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">  
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />  
              Connexion sécurisée  
            </div>  
  
            {title && (  
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">  
                {title}  
              </h1>  
            )}  
            {subtitle && (  
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">{subtitle}</p>  
            )}  
          </div>  
  
          {/* Form card — thin top brand accent, neutral body */}  
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-7 shadow-xl shadow-slate-950/40 animate-scale-in overflow-hidden">  
            {/* top accent bar */}  
            <div  
              aria-hidden="true"  
              className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-transparent"  
            />  
            {children}  
          </div>  
        </div>  
      </main>  
    </div>  
  );  
}