import { useEffect, useState } from 'react';  
import { Link } from 'react-router-dom';  
import toast from 'react-hot-toast';  
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
  Star,  
  ChevronRight,  
  Zap,  
  ScanSearch,  
  Loader2,  
  Plus,  
} from 'lucide-react';  
import { Card } from '../components/ui';  
import { securityService, accountService } from '../services';  
import { formatDate, CATEGORY_LABELS } from '../utils/helpers';  
  
// SecurityLog.action is stored as an enum key on the backend — map to FR labels.  
const ACTION_LABELS = {  
  login: 'Connexion',  
  'login-failed': 'Échec de connexion',  
  logout: 'Déconnexion',  
  'password-change': 'Changement de mot de passe',  
  'account-created': 'Compte créé',  
  'account-updated': 'Compte modifié',  
  'account-deleted': 'Compte supprimé',  
  '2fa-enabled': '2FA activée',  
  '2fa-disabled': '2FA désactivée',  
  '2fa-verified': '2FA vérifiée',  
  '2fa-recovery-codes-generated': 'Codes de récupération générés',  
  'profile-updated': 'Profil mis à jour',  
  'data-exported': 'Données exportées',  
  'data-imported': 'Données importées',  
};  
  
const CATEGORY_ICONS = {  
  email: '📧',  
  social: '👥',  
  finance: '💳',  
  work: '💼',  
  entertainment: '🎮',  
  other: '📌',  
};  
  
// Number of days after which a password is considered "old" (matches the  
// backend default renewal window in generateReminderNotifications).  
const PASSWORD_AGE_WARNING_DAYS = 90;  
  
const daysSince = (date) =>  
  Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));  
  
export default function Dashboard() {  
  const [stats, setStats] = useState(null);  
  const [recentAccounts, setRecentAccounts] = useState([]);  
  const [allAccounts, setAllAccounts] = useState([]);  
  const [recentActivity, setRecentActivity] = useState([]);  
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [scanning, setScanning] = useState(false);  
  
  const load = async () => {  
    try {  
      const [dashRes, accountsRes, statsRes] = await Promise.all([  
        securityService.getDashboard(),  
        accountService.getAll(),  
        accountService.getStats(),  
      ]);  
  
      // getAccountStats lacks unreadNotifications & categoryBreakdown;  
      // getDashboardStats provides them. Merge so both are available.  
      const dashStats = dashRes.data?.stats || {};  
      const accountStats = statsRes.data || {};  
      setStats({ ...dashStats, ...accountStats });  
  
      setCategoryBreakdown(dashStats.categoryBreakdown || null);  
      setRecentActivity(dashRes.data?.recentActivity || []);  
  
      const accounts = accountsRes.data.accounts || [];  
      setAllAccounts(accounts);  
      setRecentAccounts(accounts.slice(0, 4));  
    } catch {  
      // handled by interceptor  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  useEffect(() => {  
    load();  
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, []);  
  
  const handleScan = async () => {  
    if (scanning) return;  
    setScanning(true);  
    try {  
      const res = await securityService.generateReminders();  
      toast.success(res.data?.message || 'Analyse terminée');  
      await load(); // refresh stats + unread notification count  
    } catch {  
      // handled by interceptor  
    } finally {  
      setScanning(false);  
    }  
  };  
  
  if (loading) {  
    return (  
      <div className="flex items-center justify-center h-64">  
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />  
      </div>  
    );  
  }  
  
  const score = stats?.securityScore || 0;  
  const alertCount = (stats?.weakPasswords || 0) + (stats?.outdatedPasswords || 0);  
  const scoreTone =  
    score >= 80  
      ? { text: 'text-emerald-400', bar: 'bg-emerald-500', chip: '🟢 Excellent' }  
      : score >= 60  
        ? { text: 'text-yellow-400', bar: 'bg-yellow-500', chip: '🟡 Bon' }  
        : { text: 'text-red-400', bar: 'bg-red-500', chip: '🔴 À améliorer' };  
  
  // Oldest passwords first, for the "Santé des mots de passe" card.  
  const oldestAccounts = [...allAccounts]  
    .sort(  
      (a, b) => new Date(a.lastPasswordChange) - new Date(b.lastPasswordChange)  
    )  
    .slice(0, 4);  
  
  const statCards = [  
    {  
      label: 'Comptes enregistrés',  
      value: stats?.totalAccounts || 0,  
      icon: Lock,  
      color: 'text-brand-400 bg-brand-600/20',  
    },  
    {  
      label: 'Score de sécurité',  
      value: `${score}%`,  
      icon: Shield,  
      color:  
        score >= 80  
          ? 'text-emerald-400 bg-emerald-600/20'  
          : score >= 60  
            ? 'text-yellow-400 bg-yellow-600/20'  
            : 'text-red-400 bg-red-600/20',  
    },  
    {  
      label: 'Mots de passe forts',  
      value: stats?.strongPasswords || 0,  
      icon: CheckCircle2,  
      color: 'text-emerald-400 bg-emerald-600/20',  
    },  
    {  
      label: 'Alertes de sécurité',  
      value: alertCount,  
      icon: AlertCircle,  
      color: alertCount > 0 ? 'text-red-400 bg-red-600/20' : 'text-slate-400 bg-slate-600/20',  
    },  
  ];  
  
  return (  
    <div className="space-y-6 animate-fade-in max-w-7xl">  
      <div className="animate-slide-in-down flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">  
        <div>  
          <h1 className="text-2xl font-bold text-slate-100">Tableau de bord</h1>  
          <p className="text-slate-400 mt-1">Vue d'ensemble de votre sécurité numérique</p>  
        </div>  
        <button  
          type="button"  
          onClick={handleScan}  
          disabled={scanning}  
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"  
        >  
          {scanning ? (  
            <Loader2 className="w-4 h-4 animate-spin" />  
          ) : (  
            <ScanSearch className="w-4 h-4" />  
          )}  
          {scanning ? 'Analyse…' : 'Analyser ma sécurité'}  
        </button>  
      </div>  
  
      {/* Stat cards */}  
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">  
        {statCards.map(({ label, value, icon: Icon, color }) => (  
          <Card key={label} className="!p-4">  
            <div className="flex items-center gap-4">  
              <div className={`p-3 rounded-xl ${color}`}>  
                <Icon className="w-5 h-5" />  
              </div>  
              <div className="flex-1 min-w-0">  
                <p className="text-2xl font-bold text-slate-100">{value}</p>  
                <p className="text-sm text-slate-400 truncate">{label}</p>  
              </div>  
            </div>  
          </Card>  
        ))}  
      </div>  
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">  
        {/* Left column */}  
        <div className="lg:col-span-2 space-y-6">  
          <Card title="État de la sécurité">  
            <div className="grid grid-cols-2 gap-4">  
              <div className="p-3 bg-slate-800/50 rounded-lg">  
                <p className="text-xs text-slate-400 mb-1">Mots de passe faibles</p>  
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
            {alertCount > 0 && (  
              <div className="mt-4 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">  
                <p className="text-sm text-red-300 font-medium">  
                  Action requise : {alertCount} compte(s) nécessitent une attention.  
                </p>  
              </div>  
            )}  
          </Card>  
  
          {/* NEW: Password health (age) card */}  
          {oldestAccounts.length > 0 && (  
            <Card  
              title="Santé des mots de passe"  
              subtitle="Les mots de passe les plus anciens à renouveler en priorité"  
              action={  
                <Link to="/accounts" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">  
                  Gérer →  
                </Link>  
              }  
            >  
              <ul className="space-y-2">  
                {oldestAccounts.map((account) => {  
                  const age = daysSince(account.lastPasswordChange);  
                  const isOld = age >= PASSWORD_AGE_WARNING_DAYS;  
                  return (  
                    <li key={account._id}>  
                      <Link  
                        to="/accounts"  
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-transparent hover:bg-slate-800 hover:border-brand-500/40 transition-colors group"  
                      >  
                        <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">  
                          <span className="text-brand-400 font-bold">  
                            {account.serviceName?.charAt(0).toUpperCase()}  
                          </span>  
                        </div>  
                        <div className="min-w-0 flex-1">  
                          <p className="font-medium text-slate-100 truncate">{account.serviceName}</p>  
                          <p className="text-xs text-slate-400 truncate">{account.username}</p>  
                        </div>  
                        <span  
                          className={`text-xs px-2 py-0.5 rounded-md shrink-0 font-medium ${  
                            isOld  
                              ? 'bg-orange-600/20 text-orange-300'  
                              : 'bg-slate-700/50 text-slate-300'  
                          }`}  
                        >  
                          {age} j  
                        </span>  
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0" />  
                      </Link>  
                    </li>  
                  );  
                })}  
              </ul>  
            </Card>  
          )}  
  
          <Card  
            title="Comptes récents"  
            action={  
              <Link to="/accounts" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">  
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
              <div className="space-y-2">  
                {recentAccounts.map((account) => (  
                  <Link  
                    key={account._id}  
                    to="/accounts"  
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-transparent hover:bg-slate-800 hover:border-brand-500/40 transition-colors group"  
                  >  
                    <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">  
                      <span className="text-brand-400 font-bold">  
                        {account.serviceName?.charAt(0).toUpperCase()}  
                      </span>  
                    </div>  
                    <div className="min-w-0 flex-1">  
                      <div className="flex items-center gap-2">  
                        <p className="font-medium text-slate-100 truncate">{account.serviceName}</p>  
                        {account.isFavorite && (  
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />  
                        )}  
                      </div>  
                      <p className="text-xs text-slate-400 truncate">{account.username}</p>  
                    </div>  
                    <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 shrink-0">  
                      {CATEGORY_LABELS[account.category] || account.category}  
                    </span>  
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0" />  
                  </Link>  
                ))}  
              </div>  
            )}  
          </Card>  
  
          <Card title="Activité récente" subtitle="Vos 5 dernières actions">  
            {recentActivity.length === 0 ? (  
              <div className="text-center py-8 text-slate-500">  
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />  
                <p className="text-sm">Aucune activité enregistrée</p>  
              </div>  
            ) : (  
              <ul className="space-y-1">  
                {recentActivity.slice(0, 5).map((log, idx) => (  
                  <li  
                    key={log._id}  
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors text-sm"  
                  >  
                    <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0 opacity-70" />  
                    <div className="flex-1 min-w-0">  
                      <span className="text-slate-200 truncate block">  
                        {ACTION_LABELS[log.action] || log.action}  
                      </span>  
                      <span className="text-slate-500 text-xs">{formatDate(log.createdAt)}</span>  
                    </div>  
                    {idx === 0 && (  
                      <span className="text-xs px-2 py-1 bg-brand-600 rounded shrink-0">  
                        Récent  
                      </span>  
                    )}  
                  </li>  
                ))}  
              </ul>  
            )}  
          </Card>  
        </div>  
  
        {/* Right column */}  
        <div className="space-y-6">  
          {/* NEW: Quick actions card */}  
          <Card title="Actions rapides">  
            <div className="space-y-2">  
              <button  
                type="button"  
                onClick={handleScan}  
                disabled={scanning}  
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/40 border border-transparent hover:bg-slate-800 hover:border-brand-500/40 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"  
              >  
                <div className="p-2 rounded-lg bg-brand-600/20 shrink-0">  
                  {scanning ? (  
                    <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />  
                  ) : (  
                    <ScanSearch className="w-4 h-4 text-brand-400" />  
                  )}  
                </div>  
                <div className="flex-1 min-w-0">  
                  <p className="text-sm font-medium text-slate-100">Analyser ma sécurité</p>  
                  <p className="text-xs text-slate-400">Générer les rappels et alertes</p>  
                </div>  
              </button>  
  
              <Link  
                to="/password-generator"  
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/40 border border-transparent hover:bg-slate-800 hover:border-brand-500/40 transition-colors group"  
              >  
                <div className="p-2 rounded-lg bg-brand-600/20 shrink-0">  
                  <Zap className="w-4 h-4 text-brand-400" />  
                </div>  
                <div className="flex-1 min-w-0">  
                  <p className="text-sm font-medium text-slate-100">Générer un mot de passe</p>  
                  <p className="text-xs text-slate-400">Créer un mot de passe fort</p>  
                </div>  
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0" />  
              </Link>  
  
              <Link  
                to="/accounts"  
                className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-800/40 border border-transparent hover:bg-slate-800 hover:border-brand-500/40 transition-colors group"  
              >  
                <div className="p-2 rounded-lg bg-brand-600/20 shrink-0">  
                  <Plus className="w-4 h-4 text-brand-400" />  
                </div>  
                <div className="flex-1 min-w-0">  
                  <p className="text-sm font-medium text-slate-100">Ajouter un compte</p>  
                  <p className="text-xs text-slate-400">Enregistrer un nouvel identifiant</p>  
                </div>  
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 shrink-0" />  
              </Link>  
            </div>  
          </Card>  
  
          <Card  
            title="Sécurité"  
            subtitle={  
              stats?.twoFactorEnabled  
                ? '✓ 2FA activée — Protection maximale'  
                : '⚠ 2FA non activée — Activez-la pour plus de sécurité'  
            }  
          >  
            <div className="space-y-4">  
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">  
                <TrendingUp className="w-4 h-4 text-brand-400 shrink-0" />  
                <div className="flex-1 text-sm">  
                  <span className="text-slate-400">Score de sécurité</span>  
                  <div className="mt-1 flex items-center justify-between">  
                    <span className={`font-semibold ${scoreTone.text}`}>{score}%</span>  
                    <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">  
                      {scoreTone.chip}  
                    </span>  
                  </div>  
                </div>  
              </div>  
  
              <div className="w-full bg-slate-800 rounded-full h-2.5">  
                <div  
                  className={`h-2.5 rounded-full transition-all ${scoreTone.bar}`}  
                  style={{ width: `${score}%` }}  
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
  
              <Link  
                to="/notifications"  
                className="flex items-center justify-between gap-2 text-xs text-slate-400 p-2 bg-slate-800/30 rounded hover:bg-slate-800/60 transition-colors"  
              >  
                <span className="flex items-center gap-2">  
                  <Bell className="w-3.5 h-3.5" />  
                  {stats?.unreadNotifications || 0} notification(s) non lue(s)  
                </span>  
                <ChevronRight className="w-3.5 h-3.5" />  
              </Link>  
            </div>  
          </Card>  
  
          {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (  
            <Card title="Répartition des comptes">  
              <ul className="space-y-2.5">  
                {Object.entries(categoryBreakdown).map(([category, count]) => {  
                  const total = stats?.totalAccounts || 1;  
                  const percentage = Math.round((count / total) * 100);  
                  return (  
                    <li key={category}>  
                      <div className="flex items-center justify-between text-xs mb-1">  
                        <span className="text-slate-300">  
                          {CATEGORY_ICONS[category] || '📌'}{' '}  
                          {CATEGORY_LABELS[category] || category}  
                        </span>  
                        <span className="text-slate-400">{count}</span>  
                      </div>  
                      <div className="w-full bg-slate-800 rounded-full h-1.5">  
                        <div  
                          className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400"  
                          style={{ width: `${percentage}%` }}  
                        />  
                      </div>  
                    </li>  
                  );  
                })}  
              </ul>  
            </Card>  
          )}  
  
          <Card title="Recommandations de sécurité">  
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
                  <span>Changez vos {stats.outdatedPasswords} mot(s) de passe obsolète(s)</span>  
                </li>  
              )}  
              {!stats?.twoFactorEnabled && (  
                <li className="flex items-start gap-2 p-2 bg-blue-600/10 rounded text-xs text-blue-300">  
                  <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />  
                  <span>  
                    <Link to="/settings" className="underline hover:no-underline">  
                      Activez l'authentification 2FA  
                    </Link>{' '}  
                    pour plus de sécurité  
                  </span>  
                </li>  
              )}  
              {stats?.strongPasswords === stats?.totalAccounts && stats?.totalAccounts > 0 && (  
                <li className="flex items-start gap-2 p-2 bg-emerald-600/10 rounded text-xs text-emerald-300">  
                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />  
                  <span>Excellente sécurité ! Tous vos mots de passe sont forts.</span>  
                </li>  
              )}  
            </ul>  
          </Card>  
        </div>  
      </div>  
    </div>  
  );  
}