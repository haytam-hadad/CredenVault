import { useState } from 'react';  
import { Link, useNavigate } from 'react-router-dom';  
import { Mail, Lock, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';  
import toast from 'react-hot-toast';  
import { Button, Input } from '../components/ui';  
import AuthLayout from '../components/layout/AuthLayout';  
import useAuthStore from '../store/authStore';  
  
export default function Login() {  
  const navigate = useNavigate();  
  const { login, isLoading, requires2FA, pendingEmail } = useAuthStore();  
  const [form, setForm] = useState({ email: '', password: '', otpToken: '', recoveryCode: '' });  
  const [useRecovery, setUseRecovery] = useState(false);  
  const [errors, setErrors] = useState({});  
  
  const handleChange = (e) => {  
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));  
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));  
  };  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    const newErrors = {};  
    if (!form.email && !requires2FA) newErrors.email = 'Email requis';  
    if (!form.password) newErrors.password = 'Mot de passe requis';  
    if (requires2FA && !useRecovery && !form.otpToken) newErrors.otpToken = 'Code OTP requis';  
    if (requires2FA && useRecovery && !form.recoveryCode) newErrors.recoveryCode = 'Code de récupération requis';  
    if (Object.keys(newErrors).length) return setErrors(newErrors);  
  
    try {  
      let credentials;  
      if (requires2FA) {  
        credentials = useRecovery  
          ? { email: pendingEmail, password: form.password, recoveryCode: form.recoveryCode.trim() }  
          : { email: pendingEmail, password: form.password, otpToken: form.otpToken };  
      } else {  
        credentials = { email: form.email, password: form.password };  
      }  
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
  
  // Whether the submit button should be enabled on the 2FA step  
  const twoFAReady = useRecovery  
    ? form.recoveryCode.trim().length > 0  
    : form.otpToken.length === 6;  
  
  return (  
    <AuthLayout  
      title="Se connecter"  
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
              <div className="flex items-center justify-between">  
                {form.password && !errors.password ? (  
                  <p className="text-xs text-slate-500">  
                    {form.password.length < 8  
                      ? `${8 - form.password.length} caractères requis`  
                      : '✓ Mot de passe fort'}  
                  </p> 
                ) : (  
                  <span />  
                )}  
                <Link  
                  to="/forgot-password"  
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"  
                >  
                  Mot de passe oublié ?  
                </Link> 
              </div>  
            </div>  
          </>  
        ) : (  
          <>  
            {/* 2FA Status */}  
            <div className="p-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl">  
              <p className="text-sm text-slate-300">  
                Authentification à deux facteurs activée pour:  
              </p>  
              <p className="text-slate-100 font-semibold mt-2 break-all">  
                {pendingEmail}  
              </p>  
            </div>  
  
            {!useRecovery ? (  
              /* OTP Input */  
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
                  <p className="text-xs text-slate-400">  
                    {form.otpToken.length}/6 caractères  
                  </p>  
                )}  
              </div>  
            ) : (  
              /* Recovery Code Input */  
              <div className="space-y-2">  
                <Input  
                  label="Code de récupération"  
                  name="recoveryCode"  
                  type="text"  
                  icon={KeyRound}  
                  value={form.recoveryCode}  
                  onChange={handleChange}  
                  error={errors.recoveryCode}  
                  placeholder="XXXXX-XXXXX"  
                  autoComplete="one-time-code"  
                />  
                <p className="text-xs text-slate-400">  
                  Entrez l'un de vos codes de récupération à usage unique.  
                </p>  
              </div>  
            )}  
  
            {/* Toggle between OTP and recovery code */}  
            <button  
              type="button"  
              onClick={() => {  
                setUseRecovery((v) => !v);  
                setErrors({});  
                setForm((prev) => ({ ...prev, otpToken: '', recoveryCode: '' }));  
              }}  
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"  
            >  
              {useRecovery  
                ? '← Utiliser un code de l\'application authenticateur'  
                : 'Vous avez perdu votre téléphone ? Utiliser un code de récupération'}  
            </button>  
          </>  
        )}  
  
        {/* Submit Button */}  
        <Button  
          type="submit"  
          loading={isLoading}  
          disabled={requires2FA ? !twoFAReady : !form.email || !form.password}  
          className="w-full group !mt-8"  
        >  
          <span className="flex items-center justify-center gap-2">  
            {requires2FA ? 'Vérifier le code' : 'Se connecter'}  
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />  
          </span>  
        </Button>  
  
        {/* Security Features */}  
        <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">  
          <div className="flex items-center gap-2 text-xs text-slate-400">  
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />  
            <span>Chiffrement AES-256</span>  
          </div>  
          <div className="flex items-center gap-2 text-xs text-slate-400">  
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />  
            <span>Authentification 2FA</span>  
          </div>  
        </div>  
  
        {/* Footer Link */}  
        <p className="text-center text-sm text-slate-500 mt-6">  
          Pas encore de compte ?{' '}  
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">  
            S'inscrire  
          </Link>  
        </p>  
  
        {/* Trust Badge */}  
        <div className="mt-4 text-center">  
          <p className="text-xs text-slate-600">  
            🔒 Vos données sont sécurisées avec CredenVault  
          </p>  
        </div>  
      </form>  
    </AuthLayout>  
  );  
}