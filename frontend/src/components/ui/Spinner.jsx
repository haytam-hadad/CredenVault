export default function Spinner({ className = '', label }) {  
  return (  
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>  
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />  
      {label && <p className="text-slate-500 text-sm">{label}</p>}  
    </div>  
  );  
}