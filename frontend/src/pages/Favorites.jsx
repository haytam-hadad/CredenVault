import { useEffect, useRef, useState } from 'react';  
import {  
  Star,  
  Copy,  
  Eye,  
  EyeOff,  
  Trash2,  
  Check,  
  ExternalLink,  
  Shield,  
  AlertCircle,  
  CheckCircle2,  
} from 'lucide-react';  
import toast from 'react-hot-toast';  
import { Card, Button } from '../components/ui';  
import { useReauth } from '../components/auth/ReAuthContext';  
import { accountService } from '../services';  
import { STRENGTH_LABELS, CATEGORY_LABELS } from '../utils/helpers';  
  
const getStrengthColor = (score) => {  
  if (score <= 1) return 'text-red-500';  
  if (score <= 2) return 'text-orange-500';  
  if (score <= 3) return 'text-yellow-500';  
  return 'text-emerald-500';  
};  
const getStrengthBgColor = (score) => {  
  if (score <= 1) return 'bg-red-600/10';  
  if (score <= 2) return 'bg-orange-600/10';  
  if (score <= 3) return 'bg-yellow-600/10';  
  return 'bg-emerald-600/20';  
};  
  
// How long a revealed password stays visible before auto-hiding (ms).  
const REVEAL_TIMEOUT = 20000;  
  
export default function Favorites() {  
  const { requireReauth } = useReauth();  
  const [favorites, setFavorites] = useState([]);  
  const [loading, setLoading] = useState(true);  
  // Maps account id -> decrypted password once revealed via re-auth.  
  const [revealed, setRevealed] = useState({});  
  // Tracks which card recently had its password copied (for the check icon).  
  const [copiedId, setCopiedId] = useState(null);  
  // Timers for auto-hiding revealed passwords, keyed by account id.  
  const hideTimers = useRef({});  
  const copiedTimer = useRef(null);  
  
  useEffect(() => {  
    loadFavorites();  
  }, []);  
  
  // Clean up any pending timers on unmount.  
  useEffect(() => {  
    return () => {  
      Object.values(hideTimers.current).forEach(clearTimeout);  
      if (copiedTimer.current) clearTimeout(copiedTimer.current);  
    };  
  }, []);  
  
  const loadFavorites = async () => {  
    try {  
      const res = await accountService.getAll({ isFavorite: true });  
      setFavorites(res.data?.accounts || []);  
    } catch (error) {  
      console.error('Failed to load favorites:', error);  
      toast.error('Échec du chargement des favoris');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const hidePassword = (id) => {  
    setRevealed((prev) => {  
      const next = { ...prev };  
      delete next[id];  
      return next;  
    });  
    if (hideTimers.current[id]) {  
      clearTimeout(hideTimers.current[id]);  
      delete hideTimers.current[id];  
    }  
  };  
  
  const removeFavorite = async (account) => {  
    const confirmed = window.confirm(  
      `Retirer "${account.serviceName}" de vos favoris ?`  
    );  
    if (!confirmed) return;  
    try {  
      await accountService.update(account._id, { isFavorite: false });  
      setFavorites((prev) => prev.filter((f) => f._id !== account._id));  
      hidePassword(account._id);  
      toast.success('Retiré des favoris');  
    } catch (error) {  
      toast.error(error.message || 'Échec du retrait du favori');  
    }  
  };  
  
  const copyPassword = (account) => {  
    requireReauth(  
      async () => {  
        try {  
          const res = await accountService.getOne(account._id);  
          await navigator.clipboard.writeText(res.data.account.password);  
          setCopiedId(account._id);  
          if (copiedTimer.current) clearTimeout(copiedTimer.current);  
          copiedTimer.current = setTimeout(() => setCopiedId(null), 2000);  
          toast.success('Mot de passe copié !');  
        } catch (error) {  
          toast.error(error.message || 'Échec de la copie');  
        }  
      },  
      {  
        title: 'Afficher le mot de passe',  
        description: `Confirmez votre identité pour copier le mot de passe de "${account.serviceName}".`,  
        actionLabel: 'Copier',  
      }  
    );  
  };  
  
  const toggleShowPassword = (account) => {  
    if (revealed[account._id]) {  
      hidePassword(account._id);  
      return;  
    }  
  
    requireReauth(  
      async () => {  
        try {  
          const res = await accountService.getOne(account._id);  
          setRevealed((prev) => ({ ...prev, [account._id]: res.data.account.password }));  
          // Auto-hide after the timeout for security.  
          if (hideTimers.current[account._id]) clearTimeout(hideTimers.current[account._id]);  
          hideTimers.current[account._id] = setTimeout(  
            () => hidePassword(account._id),  
            REVEAL_TIMEOUT  
          );  
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
  
  if (loading) {  
    return (  
      <div className="flex justify-center items-center min-h-screen">  
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />  
      </div>  
    );  
  }  
  
  return (  
    <div className="space-y-6 animate-fade-in">  
      <div>  
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">  
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />  
          Favoris  
        </h1>  
        <p className="text-slate-400 mt-1">  
          Accès rapide à vos comptes importants  
        </p>  
      </div>  
  
      {favorites.length > 0 ? (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">  
          {favorites.map((account) => {  
            const strengthScore = account.passwordStrength?.score;  
            const isRevealed = Boolean(revealed[account._id]);  
            const isCopied = copiedId === account._id;  
            return (  
              <Card  
                key={account._id}  
                className="hover:border-brand-500/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/5 transition-all"  
              >  
                <div className="space-y-3">  
                  <div className="flex items-start justify-between gap-3">  
                    <div className="flex items-center gap-3 min-w-0">  
                      <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">  
                        <span className="text-brand-400 font-bold text-lg">  
                          {account.serviceName?.charAt(0).toUpperCase()}  
                        </span>  
                      </div>  
                      <div className="min-w-0">  
                        <h3 className="text-lg font-bold text-slate-100 truncate">  
                          {account.serviceName}  
                        </h3>  
                        <p className="text-sm text-slate-400 truncate">  
                          {account.username}  
                        </p>  
                      </div>  
                    </div>  
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />  
                  </div>  
  
                  <div className="flex items-center justify-between text-xs gap-2">  
                    <span className="px-2.5 py-1 bg-brand-500 rounded-lg text-slate-900 font-medium truncate">  
                      {CATEGORY_LABELS[account.category] || account.category}  
                    </span>  
                    <span  
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium shrink-0 ${getStrengthBgColor(strengthScore)} ${getStrengthColor(strengthScore)}`}  
                    >  
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
  
                  <div className="space-y-2">  
                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-800 rounded-lg">  
                      <span className={`text-xs truncate ${isRevealed ? 'text-slate-100 font-mono' : 'text-slate-500'}`}>  
                        {revealed[account._id] || '••••••••'}  
                      </span>  
                      <button  
                        onClick={() => toggleShowPassword(account)}  
                        className="shrink-0 text-slate-400 hover:text-slate-100 transition-colors"  
                        aria-label={isRevealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}  
                        title={isRevealed ? 'Masquer' : 'Afficher'}  
                      >  
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}  
                      </button>  
                    </div>  
  
                    <div className="flex gap-2">  
                      <Button  
                        onClick={() => copyPassword(account)}  
                        className="flex-1"  
                      >  
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}  
                        {isCopied ? 'Copié' : 'Copier'}  
                      </Button>  
                      <Button  
                        variant="danger"  
                        onClick={() => removeFavorite(account)}  
                        className="flex-1"  
                      >  
                        <Trash2 className="w-4 h-4" />  
                        Retirer  
                      </Button>  
                    </div>  
                  </div>  
  
                  {account.url && (  
                    <a  
                      href={account.url}  
                      target="_blank"  
                      rel="noopener noreferrer"  
                      className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors truncate"  
                    >  
                      {account.url}  
                      <ExternalLink className="w-3 h-3 shrink-0" />  
                    </a>  
                  )}  
                </div>  
              </Card>  
            );  
          })}  
        </div>  
      ) : (  
        <Card>  
          <div className="text-center py-12">  
            <Star className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-50" />  
            <p className="text-slate-400 mb-2">  
              Aucun favori enregistré  
            </p>  
            <p className="text-xs text-slate-500 ">  
              Marquez vos comptes importants comme favoris pour un accès rapide  
            </p>  
          </div>  
        </Card>  
      )}  
    </div>  
  );  
}