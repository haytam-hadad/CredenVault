export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`glass-card bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-200 p-5 rounded-xl transition-all duration-200 hover:shadow-lg dark:hover:shadow-slate-900/20 light:hover:shadow-slate-200/20 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
