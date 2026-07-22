import { useEffect, useState } from 'react';
import { Calendar, LogIn, LogOut, Lock, AlertCircle, Check, X, RefreshCw, Shield } from 'lucide-react';
import { Card } from '../components/ui';
import { securityService } from '../services';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setError(null);
      const res = await securityService.getActivityLog();
      setActivities(res.data?.logs || res.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Impossible de charger les activités';
      setError(errorMessage);
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return <LogIn className="w-4 h-4" />;
      case 'login-failed':
        return <X className="w-4 h-4" />;
      case 'logout':
        return <LogOut className="w-4 h-4" />;
      case 'password-change':
        return <Lock className="w-4 h-4" />;
      case 'account-created':
        return <Check className="w-4 h-4" />;
      case 'account-updated':
      case 'profile-updated':
        return <Shield className="w-4 h-4" />;
      case 'account-deleted':
        return <X className="w-4 h-4" />;
      case '2fa-enabled':
      case '2fa-verified':
        return <Shield className="w-4 h-4" />;
      case '2fa-disabled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionColor = (action, success = true) => {
    if (!success) {
      return 'text-red-400 bg-red-400/10';
    }
    switch (action) {
      case 'login':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'logout':
        return 'text-slate-400 bg-slate-400/10';
      case 'password-change':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'account-created':
        return 'text-blue-400 bg-blue-400/10';
      case 'account-updated':
      case 'profile-updated':
        return 'text-purple-400 bg-purple-400/10';
      case 'account-deleted':
        return 'text-red-400 bg-red-400/10';
      case '2fa-enabled':
      case '2fa-verified':
        return 'text-emerald-400 bg-emerald-400/10';
      case '2fa-disabled':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'login': 'Connexion',
      'login-failed': 'Connexion échouée',
      'logout': 'Déconnexion',
      'password-change': 'Changement mot de passe',
      'account-created': 'Compte créé',
      'account-updated': 'Compte modifié',
      'account-deleted': 'Compte supprimé',
      '2fa-enabled': '2FA activé',
      '2fa-disabled': '2FA désactivé',
      '2fa-verified': '2FA vérifié',
      'profile-updated': 'Profil modifié',
    };
    return labels[action] || action;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredActivities = activities
    .filter((activity) => {
      if (filter === 'all') return true;
      if (filter === '2fa') return activity.action.includes('2fa');
      return activity.action === filter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const actionStats = {
    all: activities.length,
    'login': activities.filter(a => a.action === 'login').length,
    'login-failed': activities.filter(a => a.action === 'login-failed').length,
    'password-change': activities.filter(a => a.action === 'password-change').length,
    'account-updated': activities.filter(a => a.action === 'account-updated').length,
    '2fa': activities.filter(a => a.action.includes('2fa')).length,
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Journal d'Activité
          </h1>
          <p className="text-slate-400 mt-1">
            Consultez l'historique de vos actions de sécurité
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-brand-500 hover:bg-slate-700 text-slate-900 hover:text-slate-200  disabled:opacity-50"
          aria-label="Actualiser"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Filters with Stats */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'login', 'login-failed', 'password-change', 'account-updated', '2fa'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-colors flex items-center gap-2 ${
              filter === f
                ? 'bg-brand-600 text-slate-100'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            aria-pressed={filter === f}
          >
            <span>{f === 'all' ? 'Tous' : getActionLabel(f)}</span>
            <span className="px-2 py-0.5 rounded text-xs bg-slate-700/50 font-mono">
              {actionStats[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Sort Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-400">
          {filteredActivities.length} activité{filteredActivities.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-1 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Changer l'ordre de tri"
        >
          {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
        </button>
      </div>

      {/* Activity List */}
      <Card>
        {filteredActivities.length > 0 ? (
          <div className="space-y-1">
            {filteredActivities.map((activity, idx) => (
              <div
                key={`${activity.id || activity.createdAt}-${idx}`}
                className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700"
                role="article"
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${getActionColor(
                    activity.action,
                    activity.success
                  )}`}
                  aria-label={getActionLabel(activity.action)}
                >
                  {getActionIcon(activity.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-slate-100 font-medium">
                        {getActionLabel(activity.action)}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-slate-500 mt-1">
                          {activity.details}
                        </p>
                      )}
                      {activity.ipAddress && (
                        <p className="text-xs text-slate-600 mt-1">
                          IP: {activity.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <time
                  className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0"
                  dateTime={activity.createdAt}
                  title={formatDate(activity.createdAt)}
                >
                  <Calendar className="w-3 h-3" />
                  <span className="whitespace-nowrap">{formatDate(activity.createdAt)}</span>
                </time>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-500">
              {filter !== 'all'
                ? 'Aucune activité correspondant à ce filtre'
                : 'Aucune activité enregistrée'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

