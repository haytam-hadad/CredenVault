import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-500 light:text-slate-600 pointer-events-none" />
        )}
        <input
          ref={ref}
          className={`input-field bg-slate-800 dark:bg-slate-800 light:bg-slate-50 border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-100 dark:text-slate-100 light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-600 focus:ring-brand-500 dark:focus:ring-brand-500 light:focus:ring-brand-600 transition-all duration-200 ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 dark:border-red-500 light:border-red-400 focus:ring-red-500/50 dark:focus:ring-red-500/50 light:focus:ring-red-400/50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
});

export default Input;
