import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
            <Shield className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
          <p className="text-slate-400 mt-2">Sécurisez vos identifiants dès maintenant</p>
        </div>

        <div className="glass-card p-8">
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

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              S'inscrire
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
