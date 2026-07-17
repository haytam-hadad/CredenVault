export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`glass-card bg-slate-800/50 border border-slate-700 p-5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/20 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
