import { useEffect, useState } from 'react';
import { Bell, CheckCheck, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button } from '../components/ui';
import { securityService } from '../services';
import useNotificationStore from '../store/notificationStore';
import { formatDate } from '../utils/helpers';

const TYPE_LABELS = {
  'password-renewal': 'Renouvellement',
  'security-alert': 'Alerte sécurité',
  'account-update': 'Mise à jour',
  system: 'Système',
};

const TYPE_COLORS = {
  'password-renewal': 'text-orange-400 bg-orange-600/20',
  'security-alert': 'text-red-400 bg-red-600/20',
  'account-update': 'text-brand-400 bg-brand-600/20',
  system: 'text-slate-400 bg-slate-700/50',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  const load = async () => {
    try {
      const res = await securityService.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await securityService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'read' } : n))
      );
      fetchUnreadCount();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await securityService.markAllNotificationsRead();
      toast.success(res.message);
      await load();
      fetchUnreadCount();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const generateReminders = async () => {
    setGenerating(true);
    try {
      const res = await securityService.generateReminders();
      toast.success(res.message);
      await load();
      fetchUnreadCount();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const checkRenewals = async () => {
    setChecking(true);
    try {
      const res = await securityService.checkRenewals();
      toast.success(res.message);
      await load();
      fetchUnreadCount();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChecking(false);
    }
  };

  const unread = notifications.filter((n) => n.status === 'unread');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
          <p className="text-slate-400 mt-1">
            Rappels et alertes de sécurité · {unread.length} non lue(s)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {unread.length > 0 && (
            <Button variant="secondary" onClick={markAllRead} loading={markingAll}>
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </Button>
          )}
          <Button variant="secondary" onClick={generateReminders} loading={generating}>
            <Sparkles className="w-4 h-4" />
            Générer les rappels
          </Button>
          <Button variant="secondary" onClick={checkRenewals} loading={checking}>
            <RefreshCw className="w-4 h-4" />
            Vérifier les renouvellements
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">Aucune notification</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`glass-card p-4 flex items-start gap-4 ${
                notif.status === 'unread' ? 'border-brand-500/20' : ''
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${TYPE_COLORS[notif.type] || TYPE_COLORS.system}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                    {TYPE_LABELS[notif.type] || notif.type}
                  </span>
                  {notif.metadata?.serviceName && (
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {notif.metadata.serviceName}
                    </span>
                  )}
                  {notif.status === 'unread' && (
                    <span className="w-2 h-2 bg-brand-500 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-slate-200">{notif.message}</p>
                <p className="text-xs text-slate-600 mt-1">{formatDate(notif.createdAt)}</p>
              </div>
              {notif.status === 'unread' && (
                <button
                  onClick={() => markRead(notif._id)}
                  className="p-2 text-slate-500 hover:text-brand-400 hover:bg-slate-800 rounded-lg shrink-0"
                  title="Marquer comme lu"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

