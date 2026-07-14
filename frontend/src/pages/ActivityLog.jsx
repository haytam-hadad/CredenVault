import { useEffect, useState } from 'react';
import { Calendar, Eye, Edit, Trash2, LogIn, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui';
import { securityService } from '../services';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await securityService.getActivityLog();
      setActivities(res.data || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'create':
        return <LogIn className="w-4 h-4" />;
      case 'update':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'login':
        return <LogIn className="w-4 h-4" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'view':
        return 'text-blue-400 bg-blue-400/10';
      case 'create':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'update':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'delete':
        return 'text-red-400 bg-red-400/10';
      case 'login':
        return 'text-purple-400 bg-purple-400/10';
      case 'security':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      view: 'Consultation',
      create: 'Création',
      update: 'Modification',
      delete: 'Suppression',
      login: 'Connexion',
      security: 'Sécurité',
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

  const filteredActivities = activities.filter(
    (activity) => filter === 'all' || activity.action === filter
  );

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
        <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Journal d'Activité
        </h1>
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
          Consultez l'historique de vos actions de sécurité
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'view', 'create', 'update', 'delete', 'security'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-600 text-slate-100'
                : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300'
            }`}
          >
            {f === 'all' ? 'Tous' : getActionLabel(f)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <Card>
        {filteredActivities.length > 0 ? (
          <div className="space-y-1">
            {filteredActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${getActionColor(
                    activity.action
                  )}`}
                >
                  {getActionIcon(activity.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-slate-100 dark:text-slate-100 light:text-slate-900 font-medium">
                        {activity.description}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 mt-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(activity.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-500 light:text-slate-600">
              Aucune activité enregistrée
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
