import { ExternalLink, Star, Trash2, Edit, Shield, ShieldAlert, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { STRENGTH_LABELS, CATEGORY_LABELS, formatDate } from '../../utils/helpers';

export default function AccountCard({ account, onEdit, onDelete, onToggleFavorite }) {
  const isWeak = account.passwordStrength?.score <= 1;
  const strengthScore = account.passwordStrength?.score;
  const getStrengthColor = (score) => {
    if (score <= 1) return 'text-red-400';
    if (score <= 2) return 'text-orange-400';
    if (score <= 3) return 'text-yellow-400';
    return 'text-emerald-400';
  };
  const getStrengthBgColor = (score) => {
    if (score <= 1) return 'bg-red-600/20';
    if (score <= 2) return 'bg-orange-600/20';
    if (score <= 3) return 'bg-yellow-600/20';
    return 'bg-emerald-600/20';
  };

  return (
    <div className="glass-card p-4 hover:border-brand-500/30 hover:bg-slate-900/80 transition-all group border-l-4 border-l-brand-500">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
            <span className="text-brand-400 font-bold text-lg">
              {account.serviceName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-100 truncate">{account.serviceName}</h4>
              {account.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />}
            </div>
            <p className="text-sm text-slate-400 truncate">{account.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(account)}
              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-smooth"
              title={account.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star className={`w-4 h-4 ${account.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(account)}
              className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-smooth"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(account)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-smooth"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mt-4 pt-3 border-t border-slate-800/50">
        <div className="flex items-center justify-between text-xs">
          <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg text-slate-400 font-medium">
            {CATEGORY_LABELS[account.category] || account.category}
          </span>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium ${getStrengthBgColor(strengthScore)} ${getStrengthColor(strengthScore)}`}>
            {strengthScore >= 3 ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : strengthScore >= 2 ? (
              <Shield className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {STRENGTH_LABELS[account.passwordStrength?.label] || 'N/A'}
          </span>
        </div>

        {account.url && (
          <a
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            <Lock className="w-3 h-3" />
            Ouvrir <ExternalLink className="w-3 h-3" />
          </a>
        )}

        <div className="space-y-1 pt-2 border-t border-slate-800/50">
          <p className="text-xs text-slate-500">
            Créé le {formatDate(account.createdAt)}
          </p>
          <p className="text-xs text-slate-500">
            Modifié le {formatDate(account.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
