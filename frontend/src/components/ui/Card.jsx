export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
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
