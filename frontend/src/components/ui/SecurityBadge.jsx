import { Shield, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SecurityBadge({ level = 'medium', className = '' }) {
  const levels = {
    high: {
      bg: 'bg-emerald-600/20',
      border: 'border-emerald-600/30',
      text: 'text-emerald-300',
      icon: CheckCircle2,
      label: 'Sécurisé',
    },
    medium: {
      bg: 'bg-yellow-600/20',
      border: 'border-yellow-600/30',
      text: 'text-yellow-300',
      icon: Shield,
      label: 'Modéré',
    },
    low: {
      bg: 'bg-red-600/20',
      border: 'border-red-600/30',
      text: 'text-red-300',
      icon: AlertTriangle,
      label: 'Faible',
    },
    warning: {
      bg: 'bg-orange-600/20',
      border: 'border-orange-600/30',
      text: 'text-orange-300',
      icon: AlertCircle,
      label: 'Attention',
    },
  };

  const config = levels[level] || levels.medium;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs
                   ${config.bg} ${config.border} ${config.text} border
                   ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}
