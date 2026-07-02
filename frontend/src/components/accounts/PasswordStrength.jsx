import { STRENGTH_COLORS, STRENGTH_LABELS } from '../../utils/helpers';

export default function PasswordStrength({ strength }) {
  if (!strength) return null;

  const { score, label, feedback } = strength;
  const color = STRENGTH_COLORS[label] || 'bg-slate-600';

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? color : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${score <= 1 ? 'text-red-400' : score <= 2 ? 'text-yellow-400' : 'text-emerald-400'}`}>
          {STRENGTH_LABELS[label] || label}
        </span>
      </div>
      {feedback?.length > 0 && (
        <ul className="text-xs text-slate-500 space-y-0.5">
          {feedback.slice(0, 3).map((tip, i) => (
            <li key={i}>• {tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
