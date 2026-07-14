import { useEffect, useState } from 'react';
import { Star, Copy, Eye, Trash2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button } from '../components/ui';
import { accountService } from '../services';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const res = await accountService.getFavorites();
      setFavorites(res.data || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await accountService.toggleFavorite(id, false);
      setFavorites(favorites.filter(f => f.id !== id));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  const copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied!');
  };

  const toggleShowPassword = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
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
        <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-400" />
          Favoris
        </h1>
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
          Accès rapide à vos comptes importants
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((account) => (
            <Card key={account.id} className="hover:border-brand-500/50 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      {account.accountName}
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
                      {account.email || account.username}
                    </p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 fill-current" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
                      {showPassword[account.id] ? account.password : '•'.repeat(8)}
                    </span>
                    <button
                      onClick={() => toggleShowPassword(account.id)}
                      className="text-slate-400 hover:text-slate-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyPassword(account.password)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-slate-100 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
                    </button>
                    <button
                      onClick={() => removeFavorite(account.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Retirer
                    </button>
                  </div>
                </div>

                {account.website && (
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors block truncate"
                  >
                    {account.website}
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
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mb-2">
              Aucun favori enregistré
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
              Marquez vos comptes importants comme favoris pour un accès rapide
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
