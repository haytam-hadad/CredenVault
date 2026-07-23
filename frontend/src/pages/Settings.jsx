import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Shield,
  Bell,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Copy,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, Button, Input, Modal } from "../components/ui";
import PasswordStrength from "../components/accounts/PasswordStrength";
import { useReauth } from "../components/auth/ReAuthContext";
import useAuthStore from "../store/authStore";
import { userService, authService, securityService } from "../services";
import { validatePassword, formatDate } from "../utils/helpers";

// Mask an email as j•••@e•••.com so it is not shoulder-surfed at rest.
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "••••••••";
  const [local, domain] = email.split("@");
  const [name, ...tldParts] = domain.split(".");
  const tld = tldParts.length ? `.${tldParts.join(".")}` : "";
  const maskPart = (s) =>
    s ? `${s[0]}${"•".repeat(Math.max(3, s.length - 1))}` : "•••";
  return `${maskPart(local)}@${maskPart(name)}${tld}`;
};

export default function Settings() {
  const { requireReauth } = useReauth();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [profileUnlocked, setProfileUnlocked] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState(null);
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    settings: false,
  });
  const [twoFAModal, setTwoFAModal] = useState(false);
  const [twoFAData, setTwoFAData] = useState(null);
  const [otpToken, setOtpToken] = useState("");
  const [disableForm, setDisableForm] = useState({ password: "", token: "" });
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setAccountInfo(user);
    }
  }, [user]);

  useEffect(() => {
    userService
      .getSecuritySettings()
      .then((res) => {
        setSettings(res.data.settings);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (passwordForm.newPassword) {
        try {
          const res = await securityService.checkStrength(
            passwordForm.newPassword,
          );
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

  const revealEmail = () => {
    if (emailRevealed) {
      setEmailRevealed(false);
      return;
    }
    requireReauth(() => setEmailRevealed(true), {
      title: "Afficher l’email",
      description:
        "Confirmez votre identité pour afficher votre adresse email.",
      actionLabel: "Afficher",
    });
  };

  const unlockProfile = () => {
    requireReauth(
      () => {
        setProfileUnlocked(true);
        setEmailRevealed(true);
      },
      {
        title: "Modifier le profil",
        description:
          "Confirmez votre identité pour modifier les informations de votre compte.",
        actionLabel: "Continuer",
      },
    );
  };

  const cancelProfileEdit = () => {
    setProfile({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setProfileUnlocked(false);
    setEmailRevealed(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading((p) => ({ ...p, profile: true }));
    try {
      const res = await userService.updateProfile(profile);
      updateUser(res.data.user);
      toast.success("Profil mis à jour");
      setProfileUnlocked(false);
      setEmailRevealed(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading((p) => ({ ...p, profile: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const pwdErrors = validatePassword(passwordForm.newPassword);
    if (pwdErrors.length) return toast.error(pwdErrors.join(", "));
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    setLoading((p) => ({ ...p, password: true }));
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Mot de passe modifié");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
      toast.success("Paramètre mis à jour");
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
      toast.success("2FA activée avec succès");
      setTwoFAModal(false);
      setOtpToken("");
      updateUser({ ...user, twoFactorEnabled: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const disable2FA = async () => {
    try {
      await authService.disable2FA(disableForm);
      toast.success("2FA désactivée");
      updateUser({ ...user, twoFactorEnabled: false });
      setDisableForm({ password: "", token: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Paramètres</h1>
        <p className="text-slate-400 mt-1">
          Gérez votre profil et votre sécurité
        </p>
      </div>

      <Card title="Profil" subtitle="Informations personnelles">
        {profileUnlocked ? (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                name="firstName"
                icon={User}
                value={profile.firstName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, firstName: e.target.value }))
                }
                placeholder="Votre prénom"
              />
              <Input
                label="Nom"
                name="lastName"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, lastName: e.target.value }))
                }
                placeholder="Votre nom"
              />
            </div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="vous@exemple.com"
            />
            <div className="flex gap-2">
              <Button type="submit" loading={loading.profile}>
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={cancelProfileEdit}
              >
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Prénom</p>
                <p className="text-slate-100 font-medium">
                  {profile.firstName || "—"}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Nom</p>
                <p className="text-slate-100 font-medium">
                  {profile.lastName || "—"}
                </p>
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Email</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-100 font-medium font-mono truncate">
                  {emailRevealed ? profile.email : maskEmail(profile.email)}
                </span>
                <button
                  type="button"
                  onClick={revealEmail}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                  aria-label={
                    emailRevealed ? "Masquer l’email" : "Afficher l’email"
                  }
                >
                  {emailRevealed ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {emailRevealed ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>
            <Button type="button" onClick={unlockProfile}>
              <Pencil className="w-4 h-4" />
              Modifier le profil
            </Button>
          </div>
        )}
      </Card>

      <Card title="Mot de passe" subtitle="Modifier votre mot de passe">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            icon={Lock}
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((p) => ({
                ...p,
                currentPassword: e.target.value,
              }))
            }
            placeholder="Votre mot de passe actuel"
            autoComplete="current-password"
          />
          <div className="space-y-1.5">
            <Input
              label="Nouveau mot de passe"
              type="password"
              icon={Lock}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
              autoComplete="new-password"
            />
            <PasswordStrength strength={strength} />
          </div>
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            icon={Lock}
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((p) => ({
                ...p,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="Retapez le nouveau mot de passe"
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading.password}>
            Changer le mot de passe
          </Button>
        </form>
      </Card>

      <Card
        title="Authentification à deux facteurs (2FA)"
        subtitle="Couche de sécurité supplémentaire"
        className="border-l-4 border-l-emerald-500"
      >
        {!user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500 mb-1">
                  2FA non activée
                </p>
                <p className="text-yellow-500">
                  L'authentification à deux facteurs renforce considérablement
                  la sécurité de votre compte.
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
                <p className="font-medium text-emerald-400 mb-1">
                  2FA activée ✓
                </p>
                <p className="text-emerald-300">
                  Votre compte est protégé par une authentification basée sur
                  OTP (One-Time Password).
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-2">
                Pour désactiver la 2FA, entrez vos identifiants :
              </p>
              <div className="space-y-3">
                <Input
                  label="Mot de passe"
                  type="password"
                  value={disableForm.password}
                  onChange={(e) =>
                    setDisableForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Votre mot de passe"
                />
                <Input
                  label="Code OTP (de votre app authenticateur)"
                  type="text"
                  value={disableForm.token}
                  onChange={(e) =>
                    setDisableForm((p) => ({
                      ...p,
                      token: e.target.value.replace(/\D/g, "").slice(0, 6),
                    }))
                  }
                  maxLength={6}
                  placeholder="000000"
                  inputMode="numeric"
                />
                <Button
                  variant="danger"
                  onClick={disable2FA}
                  className="w-full"
                >
                  Désactiver la 2FA
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {accountInfo && (
        <Card
          title="Informations du compte"
          subtitle="Données de votre compte"
          className="border-l-4 border-l-blue-500"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Membre depuis
              </div>
              <p className="text-slate-100 font-medium">
                {formatDate(accountInfo.createdAt)}
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                Dernière connexion
              </div>
              <p className="text-slate-100 font-medium">
                {accountInfo.lastLogin
                  ? formatDate(accountInfo.lastLogin)
                  : "Première connexion"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {settings && (
        <Card
          title="Paramètres de sécurité"
          subtitle="Notification et politique de session"
        >
          <div className="space-y-5">
            <div className="space-y-4">
              {[
                {
                  key: "emailNotificationsEnabled",
                  label: "Notifications par email",
                  icon: Bell,
                },
                {
                  key: "loginAlertsEnabled",
                  label: "Alertes de connexion",
                  icon: Shield,
                },
              ].map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) =>
                      handleSettingsChange(key, e.target.checked)
                    }
                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-brand-600 focus:ring-brand-500"
                  />
                </label>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm text-slate-300">
                  Rappel de renouvellement (jours) :{" "}
                  <span className="text-brand-400 font-semibold">
                    {settings.passwordRenewalReminderDays}
                  </span>
                </label>
                <input
                  type="range"
                  min={30}
                  max={365}
                  step={30}
                  value={settings.passwordRenewalReminderDays}
                  onChange={(e) =>
                    handleSettingsChange(
                      "passwordRenewalReminderDays",
                      Number(e.target.value),
                    )
                  }
                  className="w-full accent-brand-500"
                />
                <p className="text-xs text-slate-500">
                  Renouveler les mots de passe tous les{" "}
                  {settings.passwordRenewalReminderDays} jours
                </p>
              </div>
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
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4 text-sm text-blue-500">
              <p className="font-bold mb-2">
                Étape 1 : Téléchargez une application authenticateur
              </p>
              <p className="text-xs">
                Google Authenticator, Authy, ou Microsoft Authenticator
                (disponible sur iOS/Android)
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 flex flex-col items-center border border-slate-700">
              <p className="text-xs text-slate-500 mb-3 font-medium">QR Code</p>
              <img
                src={twoFAData.qrCode}
                alt="QR Code 2FA"
                className="rounded-lg border-2 border-brand-500/30"
              />
              <p className="text-xs text-slate-100 mt-3">
                Scannez ce code avec votre app authenticateur
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-2">
                🔐 Clé secrète (si le scan ne fonctionne pas)
              </p>
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded font-mono text-xs text-slate-100 break-all">
                {twoFAData.secret}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(twoFAData.secret);
                    toast.success("Copié !");
                  }}
                  className="ml-auto shrink-0 p-1 text-slate-500 hover:text-brand-400"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                🔢 Étape 2 : Entrez le code de vérification
              </p>
              <Input
                value={otpToken}
                onChange={(e) =>
                  setOtpToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
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
