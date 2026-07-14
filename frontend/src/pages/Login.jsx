import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import AuthLayout from '../components/layout/AuthLayout';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, requires2FA, pendingEmail } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', otpToken: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email requis';
    if (!form.password) newErrors.password = 'Mot de passe requis';
    if (requires2FA && !form.otpToken) newErrors.otpToken = 'Code OTP requis';
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    try {
      const credentials = requires2FA
        ? { email: pendingEmail, password: form.password, otpToken: form.otpToken }
        : form;
      const res = await login(credentials);
      if (res.requires2FA) {
        toast('Entrez votre code 2FA', { icon: '🔐' });
        return;
      }
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthLayout
      subtitle="Votre coffre-fort numérique sécurisé pour tous vos mots de passe"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
            {!requires2FA ? (
              <>
                {/* Email Input */}
                <div className="space-y-2">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    icon={Mail}
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                  />
                  {form.email && !errors.email && (
                    <p className="text-xs text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Email valide
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Input
                    label="Mot de passe"
                    name="password"
                    type="password"
                    icon={Lock}
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  {form.password && !errors.password && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
                      {form.password.length < 8
                        ? `${8 - form.password.length} caractères requis`
                        : '✓ Mot de passe fort'}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 2FA Status */}
                <div className="p-4 bg-emerald-600/10 dark:bg-emerald-600/10 light:bg-emerald-600/5 border border-emerald-600/30 dark:border-emerald-600/30 light:border-emerald-600/50 rounded-xl">
                  <p className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                    Authentification à deux facteurs activée pour:
                  </p>
                  <p className="text-slate-100 dark:text-slate-100 light:text-slate-900 font-semibold mt-2 break-all">
                    {pendingEmail}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <Input
                    label="Code OTP (6 chiffres)"
                    name="otpToken"
                    type="text"
                    inputMode="numeric"
                    value={form.otpToken}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setForm(prev => ({ ...prev, otpToken: val }));
                      setErrors(prev => ({ ...prev, otpToken: '' }));
                    }}
                    error={errors.otpToken}
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                  {form.otpToken.length > 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                      {form.otpToken.length}/6 caractères
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || (requires2FA ? form.otpToken.length !== 6 : !form.email || !form.password)}
              className="w-full group !mt-8"
            >
              <span className="flex items-center justify-center gap-2">
                {requires2FA ? 'Vérifier le code' : 'Se connecter'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            {/* Security Features */}
            <div className="mt-6 pt-6 border-t border-slate-700 dark:border-slate-700 light:border-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                <span>Chiffrement AES-256</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                <span>HTTPS sécurisé</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
                <span>Authentification 2FA</span>
              </div>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-500 light:text-slate-600 mt-6">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-brand-400 dark:text-brand-400 light:text-brand-600 hover:text-brand-300 dark:hover:text-brand-300 light:hover:text-brand-700 font-semibold transition-colors">
                S'inscrire
              </Link>
            </p>

            {/* Trust Badge */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-600 light:text-slate-500">
                🔒 Vos données sont sécurisées avec CredenVault
              </p>
            </div>
          </form>
    </AuthLayout>
  );
}
