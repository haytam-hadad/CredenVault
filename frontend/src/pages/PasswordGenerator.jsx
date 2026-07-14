import { useState } from 'react';
import { Copy, RefreshCw, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui';
import { Button } from '../components/ui';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const charsets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  const generatePassword = () => {
    let chars = '';
    if (options.uppercase) chars += charsets.uppercase;
    if (options.lowercase) chars += charsets.lowercase;
    if (options.numbers) chars += charsets.numbers;
    if (options.symbols) chars += charsets.symbols;

    if (!chars) {
      toast.error('Select at least one option');
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Password copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getStrength = () => {
    if (!password) return null;
    const types = [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;
    if (length < 8 || types < 2) return 'weak';
    if (length < 12 || types < 3) return 'fair';
    if (length < 16 || types < 4) return 'good';
    return 'excellent';
  };

  const strength = getStrength();
  const strengthColors = {
    weak: 'text-red-400 bg-red-600/10',
    fair: 'text-yellow-400 bg-yellow-600/10',
    good: 'text-blue-400 bg-blue-600/10',
    excellent: 'text-emerald-400 bg-emerald-600/10',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Générateur de Mot de Passe
        </h1>
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
          Créez des mots de passe sécurisés et robustes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Password Display */}
          <Card title="Mot de passe généré">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-slate-100 dark:text-slate-100 light:text-slate-900 font-mono text-lg"
                  placeholder="Cliquez sur générer"
                />
                {password && (
                  <button
                    onClick={copyPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-brand-400 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>

              {strength && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${strengthColors[strength]}`}>
                  Force: {strength === 'weak' ? 'Faible' : strength === 'fair' ? 'Moyen' : strength === 'good' ? 'Bon' : 'Excellent'}
                </div>
              )}

              <Button onClick={generatePassword} className="w-full">
                <Zap className="w-4 h-4" />
                Générer
              </Button>
            </div>
          </Card>

          {/* Options */}
          <Card title="Options">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={() => toggleOption('uppercase')}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                    Majuscules (A-Z)
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={() => toggleOption('lowercase')}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                    Minuscules (a-z)
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={() => toggleOption('numbers')}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                    Chiffres (0-9)
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={() => toggleOption('symbols')}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                    Symboles (!@#$%...)
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Length Slider */}
        <Card title="Longueur">
          <div className="space-y-4">
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-400">{length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 light:text-slate-600 mt-1">
                caractères
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
