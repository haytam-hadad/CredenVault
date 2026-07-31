export default function Card({  
  children,  
  className = '',  
  title,  
  subtitle,  
  action,  
  hoverable = true,  
}) {  
  return (  
    <div  
      className={`glass-card group p-5 transition-all duration-300 ${  
        hoverable  
          ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-950/30 hover:border-brand-500/30'  
          : ''  
      } ${className}`}  
    >  
      {/* Subtle top accent line, revealed on hover */}  
      <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />  
  
      {(title || action) && (  
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800/70">  
          <div className="min-w-0">  
            {title && (  
              <h3 className="text-lg font-semibold text-slate-100 truncate">{title}</h3>  
            )}  
            {subtitle && (  
              <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>  
            )}  
          </div>  
          {action && <div className="flex-shrink-0">{action}</div>}  
        </div>  
      )}  
      {children}  
    </div>  
  );  
}