import { useEffect, useRef, useState } from 'react';  
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';  
import { Modal, Button } from '../ui';  
import { authService } from '../../services';  
  
// Modal that asks the user to re-enter their master password before a  
// sensitive action (revealing a password, editing account data, etc.).  
export default function ReAuthModal({  
  isOpen,  
  onClose,  
  onSuccess,  
  title = 'Vérification de sécurité',  
  description = 'Pour votre sécurité, confirmez votre identité en saisissant votre mot de passe actuel.',  
  actionLabel = 'Confirmer',  
}) {  
  const [password, setPassword] = useState('');  
  const [showPassword, setShowPassword] = useState(false);  
  const [error, setError] = useState('');  
  const [loading, setLoading] = useState(false);  
  const inputRef = useRef(null);  
  
  // Reset state and focus the field each time the modal opens.  
  useEffect(() => {  
    if (!isOpen) return undefined;  
    setPassword('');  
    setError('');  
    setShowPassword(false);  
    setLoading(false);  
    const timer = setTimeout(() => inputRef.current?.focus(), 50);  
    return () => clearTimeout(timer);  
  }, [isOpen]);  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    if (!password) {  
      setError('Veuillez saisir votre mot de passe.');  
      inputRef.current?.focus();  
      return;  
    }  
  
    setLoading(true);  
    setError('');  
    try {  
      await authService.verifyPassword(password);  
      const confirmedPassword = password;  
      setPassword('');  
      // Hand the confirmed password back so callers that need it  
      // (e.g. the export endpoint) can forward it to the backend.  
      onSuccess(confirmedPassword);  
    } catch (err) {  
      setError(err.message || 'Mot de passe incorrect. Réessayez.');  
      setPassword('');  
      inputRef.current?.focus();  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  return (  
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">  
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>  
        <div className="flex items-start gap-3 p-3 bg-brand-600/10 border border-brand-600/30 rounded-lg">  
          <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" aria-hidden="true" />  
          <p className="text-sm text-slate-300">{description}</p>  
        </div>  
  
        <div className="space-y-1.5">  
          <label htmlFor="reauth-password" className="block text-sm font-medium text-slate-300">  
            Mot de passe actuel  
          </label>  
          <div className="relative">  
            <Lock  
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none"  
              aria-hidden="true"  
            />  
            <input  
              ref={inputRef}  
              id="reauth-password"  
              type={showPassword ? 'text' : 'password'}  
              value={password}  
              onChange={(e) => {  
                setPassword(e.target.value);  
                if (error) setError('');  
              }}  
              placeholder="Votre mot de passe"  
              autoComplete="current-password"  
              aria-invalid={error ? 'true' : 'false'}  
              aria-describedby={error ? 'reauth-error' : undefined}  
              className={`input-field bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-brand-500 transition-all duration-200 pl-10 pr-10 ${  
                error ? 'border-red-500 focus:ring-red-500/50' : ''  
              }`}  
            />  
            <button  
              type="button"  
              onClick={() => setShowPassword((v) => !v)}  
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"  
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}  
              tabIndex={-1}  
            >  
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}  
            </button>  
          </div>  
          {error && (  
            <p id="reauth-error" role="alert" className="flex items-center gap-1.5 text-sm text-red-400">  
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />  
              {error}  
            </p>  
          )}  
        </div>  
  
        <div className="flex gap-2 pt-1">  
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">  
            Annuler  
          </Button>  
          <Button type="submit" loading={loading} className="flex-1">  
            {actionLabel}  
          </Button>  
        </div>  
      </form>  
    </Modal>  
  );  
}