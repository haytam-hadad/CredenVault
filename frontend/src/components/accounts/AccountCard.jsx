import { useEffect, useRef, useState } from 'react';  
import {  
  ExternalLink, Star, Trash2, Edit, Shield, ShieldAlert,  
  AlertCircle, CheckCircle2, Eye, EyeOff, Copy, Check,  
  Mail, Users, Wallet, Briefcase, Gamepad2, Globe,  
  Clock, CalendarClock, Link as LinkIcon, KeyRound, StickyNote,  
} from 'lucide-react';  
import toast from 'react-hot-toast';  
import { STRENGTH_LABELS, CATEGORY_LABELS, formatDate } from '../../utils/helpers';  
import { useReauth } from '../auth/ReAuthContext';  
import { accountService } from '../../services';  
  
// text-*-600 (not 500) so the colors stay legible on light backgrounds too.  
const getStrengthColor = (score) => {  
  if (score <= 1) return 'text-red-600';  
  if (score <= 2) return 'text-orange-600';  
  if (score <= 3) return 'text-yellow-600';  
  return 'text-emerald-600';  
};  
// /15 tints (not /10) so the badge background is visible in both light and dark modes.  
const getStrengthBgColor = (score) => {  
  if (score <= 1) return 'bg-red-500/15';  
  if (score <= 2) return 'bg-orange-500/15';  
  if (score <= 3) return 'bg-yellow-500/15';  
  return 'bg-emerald-500/15';  
};  
// Bar-fill color for the strength meter segments.  
const getStrengthBarColor = (score) => {  
  if (score <= 1) return 'bg-red-500';  
  if (score <= 2) return 'bg-orange-500';  
  if (score <= 3) return 'bg-yellow-500';  
  return 'bg-emerald-500';  
};  
  
// Lucide icon per category (falls back to Globe for unknown categories).  
const CATEGORY_ICONS = {  
  email: Mail,  
  social: Users,  
  finance: Wallet,  
  work: Briefcase,  
  entertainment: Gamepad2,  
  other: Globe,  
};  
  
// Days since the password was last changed, for the rotation-reminder badge.  
const daysSince = (date) => {  
  if (!date) return null;  
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);  
};  
  
export default function AccountCard({ account, onEdit, onDelete, onToggleFavorite }) {  
  const { requireReauth } = useReauth();  
  const strengthScore = account.passwordStrength?.score;  
  const CategoryIcon = CATEGORY_ICONS[account.category] || Globe;  
  const pwdAge = daysSince(account.lastPasswordChange);  
  const isStale = pwdAge !== null && pwdAge > 90;  
  
  // Decrypted password, only held in memory after a successful re-auth.  
  const [revealed, setRevealed] = useState(null);  
  const [copied, setCopied] = useState(false);  
  const hideTimer = useRef(null);  
  const copyTimer = useRef(null);  
  
  // Clean up timers on unmount.  
  useEffect(() => {  
    return () => {  
      clearTimeout(hideTimer.current);  
      clearTimeout(copyTimer.current);  
    };  
  }, []);  
  
  // Toggle reveal — gated behind re-auth (like Favorites.toggleShowPassword).  
  const toggleReveal = () => {  
    if (revealed) {  
      clearTimeout(hideTimer.current);  
      setRevealed(null);  
      return;  
    }  
    requireReauth(  
      async () => {  
        try {  
          const res = await accountService.getOne(account._id);  
          setRevealed(res.data.account.password);  
          // Auto-hide after 20s so a revealed secret isn't left on screen.  
          clearTimeout(hideTimer.current);  
          hideTimer.current = setTimeout(() => setRevealed(null), 20000);  
        } catch (error) {  
          toast.error(error.message || 'Échec de l’affichage du mot de passe');  
        }  
      },  
      {  
        title: 'Afficher le mot de passe',  
        description: `Confirmez votre identité pour afficher le mot de passe de "${account.serviceName}".`,  
        actionLabel: 'Afficher',  
      }  
    );  
  };  
  
  // Copy — also gated behind re-auth (like Favorites.copyPassword).  
  const copyPassword = () => {  
    requireReauth(  
      async () => {  
        try {  
          const res = await accountService.getOne(account._id);  
          await navigator.clipboard.writeText(res.data.account.password);  
          setCopied(true);  
          clearTimeout(copyTimer.current);  
          copyTimer.current = setTimeout(() => setCopied(false), 2000);  
          toast.success('Mot de passe copié !');  
        } catch (error) {  
          toast.error(error.message || 'Échec de la copie');  
        }  
      },  
      {  
        title: 'Copier le mot de passe',  
        description: `Confirmez votre identité pour copier le mot de passe de "${account.serviceName}".`,  
        actionLabel: 'Copier',  
      }  
    );  
  };  
  
  return (  
    <div className="glass-card p-4 bg-slate-800/50 border-l-4 border-l-brand-500 transition-smooth hover:border-brand-500 hover:bg-brand-500/5 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/10 group">  
      {/* Header: avatar + service + inline actions */}  
      <div className="flex items-start justify-between gap-3">  
        <div className="flex items-center gap-3 min-w-0">  
          <div className="w-11 h-11 flex items-center justify-center shrink-0 rounded-xl ring-1 ring-brand-500/60 transition-all duration-200">  
            <span className="text-brand-500 font-bold text-2xl">  
              {account.serviceName?.charAt(0).toUpperCase()}  
            </span>  
          </div>  
          <div className="min-w-0">  
            <div className="flex items-center gap-2">  
              <h4 className="font-semibold text-slate-100 truncate">{account.serviceName}</h4>  
              {account.isFavorite && (  
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />  
              )}  
            </div>  
            <p className="text-sm text-slate-400 truncate">{account.username}</p>  
          </div>  
        </div>  
  
        <div className="flex items-center gap-1 transition-opacity">  
          {onToggleFavorite && (  
            <button  
              onClick={() => onToggleFavorite(account)}  
              className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-slate-800 rounded-lg transition-smooth"  
              title={account.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}  
            >  
              <Star className={`w-4 h-4 ${account.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />  
            </button>  
          )}  
          {onEdit && (  
            <button  
              onClick={() => onEdit(account)}  
              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-slate-800 rounded-lg transition-smooth"  
              title="Modifier"  
            >  
              <Edit className="w-4 h-4" />  
            </button>  
          )}  
          {onDelete && (  
            <button  
              onClick={() => onDelete(account)}  
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-smooth"  
              title="Supprimer"  
            >  
              <Trash2 className="w-4 h-4" />  
            </button>  
          )}  
        </div>  
      </div>  
  
      {/* Password row — reveal/copy both require re-auth. Brand-tinted so it stands out. */}  
      <div className="flex items-center justify-between gap-2 p-2 mt-3 bg-brand-500/10 border border-brand-500/30 rounded-lg">  
        <span className={`text-xs truncate ${revealed ? 'text-slate-100 font-mono' : 'text-slate-400 tracking-widest'}`}>  
          {revealed || '••••••••••••'}  
        </span>  
        <div className="flex items-center gap-1 shrink-0">  
          <button  
            onClick={toggleReveal}  
            className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-500/20 rounded-md transition-colors"  
            aria-label={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}  
            title={revealed ? 'Masquer' : 'Afficher'}  
          >  
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}  
          </button>  
          <button  
            onClick={copyPassword}  
            className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-500/20 rounded-md transition-colors"  
            aria-label="Copier le mot de passe"  
            title="Copier"  
          >  
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}  
          </button>  
        </div>  
      </div>  
  
      <div className="space-y-3 mt-4 pt-3 border-t border-slate-700/60">  
        {/* All badges in a single wrapping row: category + strength + password age */}  
        <div className="flex flex-wrap items-center gap-2 text-xs">  
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium bg-brand-500/15 text-brand-600 border border-brand-500/30">  
            <CategoryIcon className="w-3.5 h-3.5" />  
            {CATEGORY_LABELS[account.category] || account.category}  
          </span>  
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${getStrengthBgColor(strengthScore)} ${getStrengthColor(strengthScore)}`}>  
            {strengthScore >= 3 ? (  
              <CheckCircle2 className="w-3.5 h-3.5" />  
            ) : strengthScore >= 2 ? (  
              <Shield className="w-3.5 h-3.5" />  
            ) : (  
              <AlertCircle className="w-3.5 h-3.5" />  
            )}  
            {STRENGTH_LABELS[account.passwordStrength?.label] || 'N/A'}  
          </span>  
          {pwdAge !== null && (  
            <span  
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${  
                isStale  
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'  
                  : 'bg-slate-700/40 text-slate-500 border-transparent'  
              }`}  
            >  
              {isStale ? <ShieldAlert className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}  
              {pwdAge === 0 ? "Modifié aujourd'hui" : `Modifié il y a ${pwdAge} j`}  
            </span>  
          )}  
        </div>  
  
        {/* Strength meter bar */}  
        <div className="flex items-center gap-1.5">  
          {[0, 1, 2, 3].map((i) => (  
            <span  
              key={i}  
              className={`h-1.5 flex-1 rounded-full transition-colors ${  
                strengthScore >= i + 1 ? getStrengthBarColor(strengthScore) : 'bg-slate-700'  
              }`}  
            />  
          ))}  
        </div>  
  
        {account.url && (  
          <a  
            href={account.url}  
            target="_blank"  
            rel="noopener noreferrer"  
            className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors"  
          >  
            <LinkIcon className="w-3 h-3" />  
            Ouvrir <ExternalLink className="w-3 h-3" />  
          </a>  
        )}  
  
        {/* Notes — read-only, only shown when the account has a note. */}  
        {account.notes && (  
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-700/30 border border-slate-700/50">  
            <StickyNote className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />  
            <div className="min-w-0">  
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">Notes</p>  
              <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">{account.notes}</p>  
            </div>  
          </div>  
        )}  
  
        {/* Dates — labeled grid with icon chips, enlarged fonts for readability */}  
        <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">  
          <div className="flex items-center gap-2">  
            <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-slate-700/40 text-slate-400">  
              <CalendarClock className="w-4 h-4" />  
            </span>  
            <div className="min-w-0">  
              <dt className="text-xs uppercase tracking-wide text-slate-500">Créé le</dt>  
              <dd className="text-sm font-medium text-slate-300 truncate">{formatDate(account.createdAt)}</dd>  
            </div>  
          </div>  
  
          <div className="flex items-center gap-2">  
            <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-slate-700/40 text-slate-400">  
              <Clock className="w-4 h-4" />  
            </span>  
            <div className="min-w-0">  
              <dt className="text-xs uppercase tracking-wide text-slate-500">Modifié le</dt>  
              <dd className="text-sm font-medium text-slate-300 truncate">{formatDate(account.updatedAt)}</dd>  
            </div>  
          </div>  
  
          {account.lastPasswordChange && (  
            <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-slate-800/50">  
              <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-brand-500/15 text-brand-500">  
                <KeyRound className="w-4 h-4" />  
              </span>  
              <div className="min-w-0">  
                <dt className="text-xs uppercase tracking-wide text-slate-500">Mot de passe modifié le</dt>  
                <dd className="text-sm font-medium text-slate-300 truncate">{formatDate(account.lastPasswordChange)}</dd>  
              </div>  
            </div>  
          )}  
        </dl>  
      </div>  
    </div>  
  );  
}