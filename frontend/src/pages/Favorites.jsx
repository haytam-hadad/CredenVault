import { useEffect, useState } from 'react';
import { Star, Copy, Eye, EyeOff, Trash2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button } from '../components/ui';
import { useReauth } from '../components/auth/ReAuthContext';
import { accountService } from '../services';

export default function Favorites() {
  const { requireReauth } = useReauth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  // Maps account id -> decrypted password once revealed via re-auth.
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await accountService.getAll({ isFavorite: true });
      const favoriteAccounts = res.accounts || res.data?.accounts || res.data || [];
      const filtered = Array.isArray(favoriteAccounts) 
        ? favoriteAccounts.filter(acc => acc.isFavorite) 
        : [];
      setFavorites(filtered);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (account) => {
    requireReauth(
      async () => {
        try {
          await accountService.update(account._id, { isFavorite: false });
          setFavorites((prev) => prev.filter((f) => f._id !== account._id));
          toast.success('Retiré des favoris');
        } catch (error) {
          toast.error(error.message || 'Échec du retrait du favori');
        }
      },
      {
        title: 'Confirmer le retrait',
        description: `Confirmez votre identité pour retirer "${account.serviceName}" de vos favoris.`,
        actionLabel: 'Retirer',
      }
    );
  };

  const copyPassword = (account) => {
    requireReauth(
      async () => {
        try {
          const res = await accountService.getOne(account._id);
          await navigator.clipboard.writeText(res.data.account.password);
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
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[account._id];
        return next;
      });
      return;
    }

    requireReauth(
      async () => {
        try {
          const res = await accountService.getOne(account._id);
          setRevealed((prev) => ({ ...prev, [account._id]: res.data.account.password }));
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
          <Heart className="w-6 h-6 text-red-400" />
          Favoris
        </h1>
        <p className="text-slate-400 mt-1">
          Accès rapide à vos comptes importants
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {favorites.map((account) => (
            <Card key={account._id} className="hover:border-brand-500/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 ">
                      {account.serviceName}
                    </h3>
                    <p className="text-sm text-slate-400 ">
                      {account.username}
                    </p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 fill-current" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-800 rounded-lg">
                    <span className={`text-xs truncate ${revealed[account._id] ? 'text-slate-100 font-mono' : 'text-slate-500'}`}>
                      {revealed[account._id] || '••••••••'}
                    </span>
                    <button
                      onClick={() => toggleShowPassword(account)}
                      className="shrink-0 text-slate-400 hover:text-slate-100 transition-colors"
                      aria-label={revealed[account._id] ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      title={revealed[account._id] ? 'Masquer' : 'Afficher'}
                    >
                      {revealed[account._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyPassword(account)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
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
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors block truncate"
                  >
                    {account.url}
                  </a>
                )}
              </div>
            </Card>
          ))}
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

