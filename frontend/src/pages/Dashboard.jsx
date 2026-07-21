import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  KeyRound,
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
  Lock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Card } from '../components/ui';
import { securityService, accountService } from '../services';
import AccountCard from '../components/accounts/AccountCard';
import { formatDate } from '../utils/helpers';
 
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, accountsRes, statsRes] = await Promise.all([
          securityService.getDashboard(),
          accountService.getAll(),
          accountService.getStats(),
        ]);
        setStats(statsRes.data || dashRes.data.stats);
        setCategoryBreakdown(dashRes.data.stats?.categoryBreakdown || null);
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
      icon: Lock,
      color: 'text-brand-400 bg-brand-600/20',
      trend: 'locked',
    },
    {
      label: 'Score de sécurité',
      value: `${stats?.securityScore || 0}%`,
      icon: Shield,
      color: `${(stats?.securityScore || 0) >= 80 ? 'text-emerald-400 bg-emerald-600/20' : (stats?.securityScore || 0) >= 60 ? 'text-yellow-400 bg-yellow-600/20' : 'text-red-400 bg-red-600/20'}`,
    },
    {
      label: 'Mots de passe forts',
      value: stats?.strongPasswords || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-600/20',
    },
    {
      label: 'Alertes de sécurité',
      value: (stats?.weakPasswords || 0) + (stats?.outdatedPasswords || 0),
      icon: AlertCircle,
      color: `${((stats?.weakPasswords || 0) + (stats?.outdatedPasswords || 0)) > 0 ? 'text-red-400 bg-red-600/20' : 'text-slate-400 bg-slate-600/20'}`,
    },
  ];
 
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Tableau de bord</h1>
        <p className="text-slate-400 mt-1">Vue d'ensemble de votre sécurité numérique</p>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="!p-4 border-l-4 border-l-brand-500 hover:border-l-brand-400 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color} transition-all`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Security Status Summary */}
          <Card title="État de la sécurité" className="border-l-4 border-l-emerald-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Faiblesse des mots de passe</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-lg font-bold text-slate-100">{stats?.weakPasswords || 0}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Mots de passe obsolètes</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-lg font-bold text-slate-100">{stats?.outdatedPasswords || 0}</span>
                </div>
              </div>
            </div>
            {((stats?.weakPasswords || 0) + (stats?.outdatedPasswords || 0)) > 0 && (
              <div className="mt-4 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                <p className="text-sm text-red-300 font-medium">
                  Action requise: {(stats?.weakPasswords || 0) + (stats?.outdatedPasswords || 0)} compte(s) nécessitent une attention.
                </p>
              </div>
            )}
          </Card>
 
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
          <Card 
            title="Sécurité" 
            subtitle={stats?.twoFactorEnabled ? '✓ 2FA activée - Protection maximale' : '⚠ 2FA non activée - Activez-la pour plus de sécurité'}
            className="border-l-4 border-l-emerald-500"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-brand-400 shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="text-slate-400">Score de sécurité</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{stats?.securityScore || 0}%</span>
                    <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                      {(stats?.securityScore || 0) >= 80 ? '🟢 Excellent' : (stats?.securityScore || 0) >= 60 ? '🟡 Bon' : '🔴 À améliorer'}
                    </span>
                  </div>
                </div>
              </div>
 
              <div className="w-full bg-slate-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    (stats?.securityScore || 0) >= 80 ? 'bg-emerald-500' : (stats?.securityScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats?.securityScore || 0}%` }}
                />
              </div>
 
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-emerald-600/10 rounded border border-emerald-600/20">
                  <span className="text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Forts
                  </span>
                  <span className="text-emerald-400 font-semibold">{stats?.strongPasswords || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-red-600/10 rounded border border-red-600/20">
                  <span className="text-slate-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    Faibles
                  </span>
                  <span className="text-red-400 font-semibold">{stats?.weakPasswords || 0}</span>
                </div>
              </div>
 
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-800/30 rounded">
                <Bell className="w-3.5 h-3.5" />
                {stats?.unreadNotifications || 0} notification(s)
              </div>
            </div>
          </Card>
 
          {/* Category Breakdown */}
          {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (
            <Card title="Répartition des comptes" className="border-l-4 border-l-blue-500">
              <ul className="space-y-2.5">
                {Object.entries(categoryBreakdown).map(([category, count]) => {
                  const categoryLabels = {
                    email: '📧 Email',
                    social: '👥 Réseaux sociaux',
                    finance: '💳 Finance',
                    work: '💼 Travail',
                    entertainment: '🎮 Divertissement',
                    other: '📌 Autres',
                  };
                  const total = stats?.totalAccounts || 1;
                  const percentage = Math.round((count / total) * 100);
 
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300">{categoryLabels[category] || category}</span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </ul>
            </Card>
          )}
 
          <Card title="Recommandations de sécurité" className="border-l-4 border-l-orange-500">
            <ul className="space-y-2">
              {stats?.weakPasswords > 0 && (
                <li className="flex items-start gap-2 p-2 bg-red-600/10 rounded text-xs text-red-300">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Mettez à jour vos {stats.weakPasswords} mot(s) de passe faible(s)</span>
                </li>
              )}
              {stats?.outdatedPasswords > 0 && (
                <li className="flex items-start gap-2 p-2 bg-orange-600/10 rounded text-xs text-orange-300">
                  <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Changez vos {stats.outdatedPasswords} mot(s) de passe obsolète(s) (3+ mois)</span>
                </li>
              )}
              {!stats?.twoFactorEnabled && (
                <li className="flex items-start gap-2 p-2 bg-blue-600/10 rounded text-xs text-blue-300">
                  <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span><Link to="/settings" className="underline hover:no-underline">Activez l'authentification 2FA</Link> pour plus de sécurité</span>
                </li>
              )}
              {stats?.strongPasswords === stats?.totalAccounts && stats?.totalAccounts > 0 && (
                <li className="flex items-start gap-2 p-2 bg-emerald-600/10 rounded text-xs text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Excellente sécurité! Tous vos mots de passe sont forts.</span>
                </li>
              )}
            </ul>
          </Card>
 
          <Card title="Activité récente" subtitle="Vos 5 dernières actions">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune activité enregistrée</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {recentActivity.slice(0, 5).map((log, idx) => (
                  <li key={log._id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/40 transition-colors text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0 opacity-70" />
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-300 truncate block">{log.action}</span>
                      <span className="text-slate-600 text-xs">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    {idx === 0 && <span className="text-xs px-1.5 py-0.5 bg-brand-600/30 text-brand-300 rounded whitespace-nowrap shrink-0">Récent</span>}
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