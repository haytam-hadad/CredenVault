import { useState } from 'react';  
import { Link, useNavigate, useSearchParams } from 'react-router-dom';  
import { Lock, ArrowRight } from 'lucide-react';  
import toast from 'react-hot-toast';  
import { Button, Input } from '../components/ui';  
import AuthLayout from '../components/layout/AuthLayout';  
import { authService } from '../services';  
  
export default function ResetPassword() {  
  const navigate = useNavigate();  
  const [searchParams] = useSearchParams();  
  const token = searchParams.get('token');  
  
  const [form, setForm] = useState({ password: '', confirmPassword: '' });  
  const [errors, setErrors] = useState({});  
  const [isLoading, setIsLoading] = useState(false);  
  
  const handleChange = (e) => {  
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));  
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));  
  };  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
  
    const newErrors = {};  
    if (!form.password) newErrors.password = 'Mot de passe requis';  
    else if (form.password.length < 8)  
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';  
    if (form.password !== form.confirmPassword)  
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';  
    if (Object.keys(newErrors).length) return setErrors(newErrors);  
  
    setIsLoading(true);  
    try {  
      await authService.resetPassword({ token, password: form.password });  
      toast.success('Mot de passe réinitialisé avec succès');  
      navigate('/login');  
    } catch (err) {  
      toast.error(err.message || 'Token invalide ou expiré');  
    } finally {  
      setIsLoading(false);  
    }  
  };  
  
  if (!token) {  
    return (  
      <AuthLayout  
        title="Lien invalide"  
        subtitle="Le lien de réinitialisation est invalide ou incomplet"  
      >  
        <div className="space-y-6">  
          <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-xl">  
            <p className="text-sm text-slate-300">  
              Ce lien de réinitialisation est invalide. Veuillez refaire une demande.  
            </p>  
          </div>  
          <Link  
            to="/forgot-password"  
            className="flex items-center justify-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors"  
          >  
            Demander un nouveau lien  
          </Link>  
        </div>  
      </AuthLayout>  
    );  
  }  
  
  return (  
    <AuthLayout  
      title="Nouveau mot de passe"  
      subtitle="Choisissez un nouveau mot de passe sécurisé"  
    >  
      <form onSubmit={handleSubmit} className="space-y-5">  
        <div className="space-y-2">  
          <Input  
            label="Nouveau mot de passe"  
            name="password"  
            type="password"  
            icon={Lock}  
            value={form.password}  
            onChange={handleChange}  
            error={errors.password}  
            placeholder="••••••••"  
            autoComplete="new-password"  
          />  
        </div>  
  
        <div className="space-y-2">  
          <Input  
            label="Confirmer le mot de passe"  
            name="confirmPassword"  
            type="password"  
            icon={Lock}  
            value={form.confirmPassword}  
            onChange={handleChange}  
            error={errors.confirmPassword}  
            placeholder="Retapez votre mot de passe"  
            autoComplete="new-password"  
          />  
        </div>  
  
        <Button  
          type="submit"  
          loading={isLoading}  
          disabled={!form.password || !form.confirmPassword}  
          className="w-full group !mt-8"  
        >  
          <span className="flex items-center justify-center gap-2">  
            Réinitialiser  
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />  
          </span>  
        </Button>  
  
        <p className="text-center text-sm text-slate-500 mt-6">  
          <Link  
            to="/login"  
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"  
          >  
            Retour à la connexion  
          </Link>  
        </p>  
      </form>  
    </AuthLayout>  
  );  
}