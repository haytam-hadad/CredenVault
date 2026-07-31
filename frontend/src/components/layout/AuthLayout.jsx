import { Sun, Moon, ShieldCheck, KeyRound, Lock } from 'lucide-react';  
import useThemeStore from '../../store/themeStore';  
  
export default function AuthLayout({ title, subtitle, children, icon: Icon }) {  
  const theme = useThemeStore((s) => s.theme);  
  const toggleTheme = useThemeStore((s) => s.toggleTheme);  
  
  return (  
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">  
      {/* Theme Toggle */}  
      <button  
        onClick={toggleTheme}  
        className="absolute top-5 right-5 z-50 p-2.5 rounded-lg text-slate-500 bg-slate-900/60 border border-slate-700 hover:text-brand-500 hover:border-brand-500/60 transition-colors duration-200"  
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}  
        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}  
      >  
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}  
      </button>  
  
      {/* Left brand panel (hidden on mobile) — slate-driven so it inverts cleanly */}  
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-r border-slate-800 overflow-hidden">  
        {/* soft accent glow (brand-500 reads on both themes) */}  
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />  
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />  
  
        {/* Logo */}  
        <div className="relative z-10 flex items-center gap-3">  
          <img src="/logo.png" alt="CredenVault" className="w-10 h-10 object-contain" />  
          <span className="text-xl font-bold text-slate-100 tracking-tight">CredenVault</span>  
        </div>  
  
        {/* Headline + feature list */}  
        <div className="relative z-10 max-w-md">  
          <h2 className="text-4xl font-extrabold leading-tight text-slate-100">  
            Votre coffre-fort numérique,{' '}  
            <span className="bg-gradient-to-r from-brand-500 to-indigo-500 bg-clip-text text-transparent">  
              sécurisé  
            </span>  
          </h2>  
          <p className="text-slate-400 mt-4 text-sm leading-relaxed">  
            Stockez, générez et gérez tous vos mots de passe en un seul endroit chiffré.  
          </p>  
  
          <ul className="mt-8 space-y-4">  
            {[  
              { icon: ShieldCheck, text: 'Chiffrement AES-256 de bout en bout' },  
              { icon: KeyRound, text: 'Authentification à deux facteurs (2FA)' },  
              { icon: Lock, text: 'Codes de récupération à usage unique' },  
            ].map(({ icon: FeatureIcon, text }) => (  
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">  
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500/15 border border-brand-500/40">  
                  <FeatureIcon className="w-4 h-4 text-brand-500" />  
                </span>  
                {text}  
              </li>  
            ))}  
          </ul>  
        </div>  
  
        {/* Footer note */}  
        <p className="relative z-10 text-xs text-slate-500">  
          © {new Date().getFullYear()} CredenVault. Tous droits réservés.  
        </p>  
      </div>  
  
      {/* Right form panel */}  
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-slate-950">  
        {/* subtle accent glow only visible faintly in both modes */}  
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />  
  
        <div className="w-full max-w-md animate-fade-in relative z-10">  
          {/* Mobile-only compact header */}  
          <div className="text-center mb-8">  
            <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/40 mb-4">  
              {Icon ? (  
                <Icon className="w-7 h-7 text-brand-500" />  
              ) : (  
                <img src="/logo.png" alt="CredenVault" className="w-8 h-8 object-contain" />  
              )}  
            </div>  
            {title && (  
              <h1 className="text-2xl font-bold text-slate-100">{title}</h1>  
            )}  
            {subtitle && (  
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">{subtitle}</p>  
            )}  
          </div>  
  
          {children}  
        </div>  
      </div>  
    </div>  
  );  
}