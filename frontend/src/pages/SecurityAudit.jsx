import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Shield, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui';
import { accountService } from '../services';

export default function SecurityAudit() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await accountService.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  const securityScore = stats?.securityScore || 0;
  const scoreColor = securityScore >= 80 ? 'emerald' : securityScore >= 60 ? 'yellow' : 'red';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Audit de Sécurité
        </h1>
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
          Analysez la force de vos mots de passe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Score */}
        <Card className={`border-l-4 border-l-${scoreColor}-500`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
              {securityScore}%
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">
              Score de sécurité
            </p>
          </div>
        </Card>

        {/* Strong Passwords */}
        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                {stats?.strongPasswords || 0}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
                Mots de passe forts
              </p>
            </div>
          </div>
        </Card>

        {/* Weak Passwords */}
        <Card>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                {stats?.weakPasswords || 0}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
                Mots de passe faibles
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <Card title="Recommandations">
          <div className="space-y-3">
            {stats?.weakPasswords > 0 && (
              <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                <p className="text-sm font-medium text-red-300">
                  ⚠️ {stats.weakPasswords} mot(s) de passe faible(s)
                </p>
                <p className="text-xs text-red-200 mt-1">
                  Mettez à jour ces comptes avec des mots de passe plus forts
                </p>
              </div>
            )}
            {stats?.outdatedPasswords > 0 && (
              <div className="p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                <p className="text-sm font-medium text-yellow-300">
                  🔄 {stats.outdatedPasswords} mot(s) de passe à renouveler
                </p>
                <p className="text-xs text-yellow-200 mt-1">
                  Changez les mots de passe non mis à jour récemment
                </p>
              </div>
            )}
            {stats?.weakPasswords === 0 && stats?.outdatedPasswords === 0 && (
              <div className="p-3 bg-emerald-600/10 border border-emerald-600/30 rounded-lg">
                <p className="text-sm font-medium text-emerald-300">
                  ✓ Aucune action requise
                </p>
                <p className="text-xs text-emerald-200 mt-1">
                  Tous vos mots de passe sont sécurisés
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Security Tips */}
        <Card title="Conseils de Sécurité">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                  Utilisez des mots de passe uniques
                </p>
                <p className="text-slate-500 dark:text-slate-500 light:text-slate-600 text-xs">
                  Chaque compte doit avoir son propre mot de passe
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                  Minimum 12 caractères
                </p>
                <p className="text-slate-500 dark:text-slate-500 light:text-slate-600 text-xs">
                  Plus long = plus sécurisé
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                  Activez la 2FA
                </p>
                <p className="text-slate-500 dark:text-slate-500 light:text-slate-600 text-xs">
                  Ajoutez une couche de sécurité supplémentaire
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <Card title="Statistiques">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
              {stats?.totalAccounts || 0}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
              Comptes enregistrés
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
              {stats?.twoFactorEnabled ? '✓' : '✗'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
              2FA {stats?.twoFactorEnabled ? 'Activée' : 'Désactivée'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
