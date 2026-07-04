import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
            <img src="/logo.png" alt="CredenVault" className="w-11 h-11 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">CredenVault</h1>
          <p className="text-slate-400 mt-2">Connectez-vous à votre coffre-fort numérique</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!requires2FA ? (
              <>
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
              </>
            ) : (
              <>
                <p className="text-sm text-slate-400 text-center">
                  Authentification à deux facteurs activée pour <strong className="text-white">{pendingEmail}</strong>
                </p>
                <Input
                  label="Code OTP (6 chiffres)"
                  name="otpToken"
                  value={form.otpToken}
                  onChange={handleChange}
                  error={errors.otpToken}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </>
            )}

            <Button type="submit" loading={isLoading} className="w-full">
              {requires2FA ? 'Vérifier' : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
