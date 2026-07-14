import { useEffect, useState } from 'react';
import { User, Lock, Shield, Bell, AlertTriangle, CheckCircle2, QrCode, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Modal } from '../components/ui';
import PasswordStrength from '../components/accounts/PasswordStrength';
import useAuthStore from '../store/authStore';
import { userService, authService, securityService } from '../services';
import { validatePassword } from '../utils/helpers';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settings, setSettings] = useState(null);
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState({ profile: false, password: false, settings: false });
  const [twoFAModal, setTwoFAModal] = useState(false);
  const [twoFAData, setTwoFAData] = useState(null);
  const [otpToken, setOtpToken] = useState('');
  const [disableForm, setDisableForm] = useState({ password: '', token: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    userService.getSecuritySettings().then((res) => {
      setSettings(res.data.settings);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (passwordForm.newPassword) {
        try {
          const res = await securityService.checkStrength(passwordForm.newPassword);
          setStrength(res.data.strength);
        } catch {
          setStrength(null);
        }
      } else {
        setStrength(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [passwordForm.newPassword]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading((p) => ({ ...p, profile: true }));
    try {
      const res = await userService.updateProfile(profile);
      updateUser(res.data.user);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading((p) => ({ ...p, profile: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const pwdErrors = validatePassword(passwordForm.newPassword);
    if (pwdErrors.length) return toast.error(pwdErrors.join(', '));
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }

    setLoading((p) => ({ ...p, password: true }));
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Mot de passe modifié');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading((p) => ({ ...p, password: false }));
    }
  };

  const handleSettingsChange = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await userService.updateSecuritySettings({ [key]: value });
      toast.success('Paramètre mis à jour');
    } catch (error) {
      toast.error(error.message);
      setSettings(settings);
    }
  };

  const setup2FA = async () => {
    try {
      const res = await authService.setup2FA();
      setTwoFAData(res.data);
      setTwoFAModal(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const verify2FA = async () => {
    try {
      await authService.verify2FA(otpToken);
      toast.success('2FA activée avec succès');
      setTwoFAModal(false);
      setOtpToken('');
      updateUser({ ...user, twoFactorEnabled: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const disable2FA = async () => {
    try {
      await authService.disable2FA(disableForm);
      toast.success('2FA désactivée');
      updateUser({ ...user, twoFactorEnabled: false });
      setDisableForm({ password: '', token: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Paramètres</h1>
        <p className="text-slate-400 mt-1">Gérez votre profil et votre sécurité</p>
      </div>

      <Card title="Profil" subtitle="Informations personnelles">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              name="firstName"
              icon={User}
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
            />
            <Input
              label="Nom"
              name="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
            />
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />
          <Button type="submit" loading={loading.profile}>Enregistrer</Button>
        </form>
      </Card>

      <Card title="Mot de passe" subtitle="Modifier votre mot de passe">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            icon={Lock}
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <div className="space-y-1.5">
            <Input
              label="Nouveau mot de passe"
              type="password"
              icon={Lock}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            />
            <PasswordStrength strength={strength} />
          </div>
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            icon={Lock}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
          <Button type="submit" loading={loading.password}>Changer le mot de passe</Button>
        </form>
      </Card>

      <Card title="Authentification à deux facteurs (2FA)" subtitle="Couche de sécurité supplémentaire" className="border-l-4 border-l-emerald-500">
        {!user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-300 mb-1">2FA non activée</p>
                <p className="text-yellow-200/80">
                  L'authentification à deux facteurs renforce considérablement la sécurité de votre compte.
                </p>
              </div>
            </div>
            <Button onClick={setup2FA} className="w-full">
              <QrCode className="w-4 h-4" />
              Activer la 2FA maintenant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-emerald-300 mb-1">2FA activée ✓</p>
                <p className="text-emerald-200/80">
                  Votre compte est protégé par une authentification basée sur OTP (One-Time Password).
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Pour désactiver la 2FA, entrez vos identifiants :</p>
              <div className="space-y-3">
                <Input
                  label="Mot de passe"
                  type="password"
                  value={disableForm.password}
                  onChange={(e) => setDisableForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Votre mot de passe"
                />
                <Input
                  label="Code OTP (de votre app authenticateur)"
                  type="text"
                  value={disableForm.token}
                  onChange={(e) => setDisableForm((p) => ({ ...p, token: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  maxLength={6}
                  placeholder="000000"
                  inputMode="numeric"
                />
                <Button variant="danger" onClick={disable2FA} className="w-full">
                  Désactiver la 2FA
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {settings && (
        <Card title="Notifications" subtitle="Préférences d'alertes">
          <div className="space-y-4">
            {[
              { key: 'emailNotificationsEnabled', label: 'Notifications par email', icon: Bell },
              { key: 'loginAlertsEnabled', label: 'Alertes de connexion', icon: Shield },
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-300">{label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => handleSettingsChange(key, e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-brand-600 focus:ring-brand-500"
                />
              </label>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">
                Rappel de renouvellement (jours) : {settings.passwordRenewalReminderDays}
              </label>
              <input
                type="range"
                min={30}
                max={365}
                step={30}
                value={settings.passwordRenewalReminderDays}
                onChange={(e) => handleSettingsChange('passwordRenewalReminderDays', Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={twoFAModal}
        onClose={() => setTwoFAModal(false)}
        title="Configurer l'authentification à deux facteurs"
      >
        {twoFAData && (
          <div className="space-y-5">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 text-sm text-blue-200">
              <p className="font-medium mb-2">📱 Étape 1 : Téléchargez une application authenticateur</p>
              <p className="text-xs">Google Authenticator, Authy, ou Microsoft Authenticator (disponible sur iOS/Android)</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center border border-slate-700">
              <p className="text-xs text-slate-500 mb-3 font-medium">QR Code</p>
              <img src={twoFAData.qrCode} alt="QR Code 2FA" className="rounded-lg border-2 border-brand-500/30" />
              <p className="text-xs text-slate-400 mt-3">
                Scannez ce code avec votre app authenticateur
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-2">Clé secrète (si le scan ne fonctionne pas)</p>
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded font-mono text-xs text-slate-300 break-all">
                {twoFAData.secret}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(twoFAData.secret);
                    toast.success('Copié !');
                  }}
                  className="ml-auto shrink-0 p-1 text-slate-500 hover:text-brand-400"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">🔢 Étape 2 : Entrez le code de vérification</p>
              <Input
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                className="text-center tracking-widest text-xl"
              />
            </div>

            <Button onClick={verify2FA} className="w-full">
              <CheckCircle2 className="w-4 h-4" />
              Vérifier et activer la 2FA
            </Button>

            <p className="text-xs text-slate-500 text-center">
              ⚠️ Conservez vos codes de sauvegarde en lieu sûr
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
