import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  KeyRound,
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Card } from '../components/ui';
import { securityService, accountService } from '../services';
import AccountCard from '../components/accounts/AccountCard';
import { formatDate } from '../utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, accountsRes] = await Promise.all([
          securityService.getDashboard(),
          accountService.getAll(),
        ]);
        setStats(dashRes.data.stats);
        setRecentActivity(dashRes.data.recentActivity || []);
        setRecentAccounts(accountsRes.data.accounts?.slice(0, 4) || []);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Comptes enregistrés',
      value: stats?.totalAccounts || 0,
      icon: KeyRound,
      color: 'text-brand-400 bg-brand-600/20',
    },
    {
      label: 'Score de sécurité',
      value: `${stats?.securityScore || 0}%`,
      icon: Shield,
      color: 'text-emerald-400 bg-emerald-600/20',
    },
    {
      label: 'Mots de passe faibles',
      value: stats?.weakPasswords || 0,
      icon: AlertTriangle,
      color: 'text-red-400 bg-red-600/20',
    },
    {
      label: 'À renouveler',
      value: stats?.outdatedPasswords || 0,
      icon: Clock,
      color: 'text-orange-400 bg-orange-600/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <p className="text-slate-400 mt-1">Vue d'ensemble de votre sécurité numérique</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="!p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Comptes récents"
            action={
              <Link to="/accounts" className="text-sm text-brand-400 hover:text-brand-300">
                Voir tout →
              </Link>
            }
          >
            {recentAccounts.length === 0 ? (
              <div className="text-center py-8">
                <KeyRound className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">Aucun compte enregistré</p>
                <Link to="/accounts" className="text-brand-400 text-sm mt-2 inline-block">
                  Ajouter votre premier compte
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {recentAccounts.map((account) => (
                  <AccountCard key={account._id} account={account} />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Sécurité" subtitle={stats?.twoFactorEnabled ? '2FA activée ✓' : '2FA non activée'}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Mots de passe forts</span>
                <span className="text-emerald-400 font-medium">{stats?.strongPasswords || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Notifications</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5" />
                  {stats?.unreadNotifications || 0} non lues
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-brand-600 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.securityScore || 0}%` }}
                />
              </div>
            </div>
          </Card>

          <Card title="Activité récente" subtitle="Dernières actions">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune activité</p>
            ) : (
              <ul className="space-y-2">
                {recentActivity.slice(0, 5).map((log) => (
                  <li key={log._id} className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-slate-400 truncate flex-1">{log.action}</span>
                    <span className="text-slate-600 text-xs shrink-0">
                      {formatDate(log.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
