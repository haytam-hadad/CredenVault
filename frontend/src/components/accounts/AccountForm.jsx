import { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button, Input } from '../ui';
import PasswordStrength from './PasswordStrength';
import { securityService } from '../../services';
import { CATEGORY_LABELS } from '../../utils/helpers';

const emptyForm = {
  serviceName: '',
  username: '',
  password: '',
  url: '',
  category: 'other',
  notes: '',
};

export default function AccountForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm({ ...emptyForm, ...initial });
  }, [initial]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.password?.length > 0) {
        try {
          const res = await securityService.checkStrength(form.password);
          setStrength(res.data.strength);
        } catch {
          setStrength(null);
        }
      } else {
        setStrength(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const generatePassword = async () => {
    try {
      const res = await securityService.generatePassword({ length: 16 });
      setForm((prev) => ({ ...prev, password: res.data.password }));
      setStrength(res.data.strength);
    } catch {
      // handled by interceptor
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.serviceName.trim()) newErrors.serviceName = 'Nom du service requis';
    if (!form.username.trim()) newErrors.username = 'Identifiant requis';
    if (!form.password) newErrors.password = 'Mot de passe requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du service"
        name="serviceName"
        value={form.serviceName}
        onChange={handleChange}
        error={errors.serviceName}
        placeholder="Ex: Gmail, Facebook, Netflix..."
      />

      <Input
        label="Identifiant / Email"
        name="username"
        value={form.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="votre@email.com"
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Mot de passe</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`input-field pr-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500/50' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="button" variant="secondary" onClick={generatePassword} title="Générer" className="transition-smooth">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
        <PasswordStrength strength={strength} />
      </div>

      <Input
        label="URL (optionnel)"
        name="url"
        value={form.url}
        onChange={handleChange}
        placeholder="https://..."
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Catégorie</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="input-field bg-slate-800 border-slate-700 text-slate-100 transition-all duration-200"
        >
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Notes (optionnel)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="input-field bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 resize-none transition-all duration-200"
          placeholder="Informations supplémentaires..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1 transition-smooth">
          {initial ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="transition-smooth">
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
