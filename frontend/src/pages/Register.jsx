import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import AuthLayout from '../components/layout/AuthLayout';
import PasswordStrength from '../components/accounts/PasswordStrength';
import useAuthStore from '../store/authStore';
import { validateEmail, validatePassword } from '../utils/helpers';
import { securityService } from '../services';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.password.length > 0) {
        try {
          const res = await securityService.checkStrength(form.password);
          setStrength(res.data.strength);
        } catch {
          setStrength(null);
        }
      } else {
        setStrength(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.password]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!validateEmail(form.email)) newErrors.email = 'Email invalide';
    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length) newErrors.password = pwdErrors.join(', ');
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (Object.keys(newErrors).length) return setErrors(newErrors);

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success('Compte créé avec succès');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Sécurisez vos identifiants dès maintenant"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Prénom"
                name="firstName"
                icon={User}
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <Input
                label="Nom"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <Input
                label="Mot de passe"
                name="password"
                type="password"
                icon={Lock}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />
              <PasswordStrength strength={strength} />
            </div>

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

        <Button type="submit" loading={isLoading} className="w-full mt-6">
          S'inscrire
        </Button>

        {/* Security Features */}
        <div className="mt-6 pt-6 border-t border-slate-700 dark:border-slate-700 light:border-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
            <span>Chiffrement AES-256</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
            <span>Stockage sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex-shrink-0" />
            <span>2FA disponible</span>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-500 light:text-slate-600 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-400 dark:text-brand-400 light:text-brand-600 hover:text-brand-300 dark:hover:text-brand-300 light:hover:text-brand-700 font-semibold transition-colors">
            Se connecter
          </Link>
        </p>

        {/* Trust Badge */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-600 light:text-slate-500">
            🔒 Votre compte est protégé dès sa création
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
