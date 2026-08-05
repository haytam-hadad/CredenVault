import { useState } from 'react';  
import { Link } from 'react-router-dom';  
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';  
import toast from 'react-hot-toast';  
import { Button, Input } from '../components/ui';  
import AuthLayout from '../components/layout/AuthLayout';  
import { authService } from '../services';  
  
export default function ForgotPassword() {  
  const [email, setEmail] = useState('');  
  const [error, setError] = useState('');  
  const [isLoading, setIsLoading] = useState(false);  
  const [sent, setSent] = useState(false);  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    if (!email) return setError('Email requis');  
  
    setIsLoading(true);  
    try {  
      const res = await authService.forgotPassword(email);  
      setSent(true);  
      toast.success(  
        res?.message ||  
          'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.'  
      );  
    } catch (err) {  
      toast.error(err.message || 'Une erreur est survenue');  
    } finally {  
      setIsLoading(false);  
    }  
  };  
  
  return (  
    <AuthLayout  
      title="Mot de passe oublié"  
      subtitle="Recevez un lien pour réinitialiser votre mot de passe"  
    >  
      {sent ? (  
        <div className="space-y-6">  
          <div className="p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl">  
            <p className="text-sm text-slate-300">  
              Si un compte existe pour <strong className="text-slate-100">{email}</strong>,  
              un email contenant un lien de réinitialisation vient d'être envoyé.  
            </p>  
          </div>  
          <Link  
            to="/login"  
            className="flex items-center justify-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors"  
          >  
            <ArrowLeft className="w-4 h-4" />  
            Retour à la connexion  
          </Link>  
        </div>  
      ) : (  
        <form onSubmit={handleSubmit} className="space-y-5">  
          <div className="space-y-2">  
            <Input  
              label="Email"  
              name="email"  
              type="email"  
              icon={Mail}  
              value={email}  
              onChange={(e) => {  
                setEmail(e.target.value);  
                setError('');  
              }}  
              error={error}  
              placeholder="vous@exemple.com"  
              autoComplete="email"  
            />  
          </div>  
  
          <Button  
            type="submit"  
            loading={isLoading}  
            disabled={!email}  
            className="w-full group !mt-8"  
          >  
            <span className="flex items-center justify-center gap-2">  
              Envoyer le lien  
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
      )}  
    </AuthLayout>  
  );  
}