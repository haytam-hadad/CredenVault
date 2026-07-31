import { forwardRef, useState } from 'react';  
import { Eye, EyeOff } from 'lucide-react';  
  
const Input = forwardRef(function Input(  
  { label, error, icon: Icon, type = 'text', className = '', containerClassName = '', ...props },  
  ref  
) {  
  const [showPassword, setShowPassword] = useState(false);  
  const isPassword = type === 'password';  
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;  
  
  const borderClasses = error  
    ? 'border-slate-700 border-l-red-500 focus:border-red-500 focus:border-l-red-500 focus:ring-red-500/40'  
    : 'border-slate-700 border-l-brand-500/40 hover:border-slate-600 hover:border-l-brand-500/70 focus:border-brand-500 focus:border-l-brand-500 focus:ring-brand-500/40';  
  
  return (  
    <div className={`space-y-1.5 ${containerClassName}`}>  
      {label && (  
        <label className="block text-sm font-medium text-slate-300">{label}</label>  
      )}  
      <div className="relative">  
        {Icon && (  
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none transition-colors" />  
        )}  
        <input  
          ref={ref}  
          type={inputType}  
          className={`input-field bg-slate-800/50 text-slate-100 placeholder-slate-500 transition-all duration-200 ${borderClasses} ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}  
          {...props}  
        />  
        {isPassword && (  
          <button  
            type="button"  
            onClick={() => setShowPassword((v) => !v)}  
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-brand-400 transition-colors"  
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}  
            tabIndex={-1}  
          >  
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}  
          </button>  
        )}  
      </div>  
      {error && <p className="text-sm text-red-400">{error}</p>}  
    </div>  
  );  
});  
  
export default Input;