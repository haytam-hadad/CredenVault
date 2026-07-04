import { ExternalLink, Star, Trash2, Edit, Shield, ShieldAlert } from 'lucide-react';
import { STRENGTH_LABELS, CATEGORY_LABELS, formatDate } from '../../utils/helpers';

export default function AccountCard({ account, onEdit, onDelete }) {
  const isWeak = account.passwordStrength?.score <= 1;

  return (
    <div className="glass-card p-4 hover:border-brand-500/30 transition-all group">
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
          {onEdit && (
            <button
              onClick={() => onEdit(account)}
              className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(account)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs">
        <span className="px-2 py-0.5 bg-slate-800 rounded-md text-slate-400">
          {CATEGORY_LABELS[account.category] || account.category}
        </span>
        <span className={`flex items-center gap-1 ${isWeak ? 'text-red-400' : 'text-emerald-400'}`}>
          {isWeak ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
          {STRENGTH_LABELS[account.passwordStrength?.label] || 'N/A'}
        </span>
        {account.url && (
          <a
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 ml-auto"
          >
            Ouvrir <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <p className="text-xs text-slate-600 mt-2">
        Modifié le {formatDate(account.updatedAt)}
      </p>
    </div>
  );
}
