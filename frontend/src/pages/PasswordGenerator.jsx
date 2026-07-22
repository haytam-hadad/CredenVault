import { useState } from 'react';
import { Copy, RefreshCw, Check, Zap, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui';
import { Button } from '../components/ui';
import { securityService } from '../services';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [options, setOptions] = useState({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const checkPasswordStrength = async (pwd) => {
    if (!pwd) {
      setStrength(null);
      setFeedback([]);
      return;
    }
    try {
      const res = await securityService.checkStrength(pwd);
      setStrength(res.data.strength);
      setFeedback(res.data.strength.feedback || []);
    } catch (error) {
      console.error('Strength check error:', error);
    }
  };

  const generatePassword = async () => {
    setLoading(true);
    try {
      const res = await securityService.generatePassword({
        length,
        ...options,
      });
      
      setPassword(res.data.password);
      setStrength(res.data.strength);
      setFeedback(res.data.strength.feedback || []);
      toast.success('Mot de passe généré avec succès');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la génération';
      toast.error(errorMsg);
      console.error('Password generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Password copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key) => {
    setOptions(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      const hasAtLeastOne = Object.values(updated).some(v => v);
      if (!hasAtLeastOne) {
        toast.error('Au moins une option doit être sélectionnée');
        return prev;
      }
      return updated;
    });
  };

  const strengthColors = {
    'very-weak': 'text-red-500 bg-red-600/5 border-red-500/30',
    'weak': 'text-red-400 bg-red-600/5 border-red-500/30',
    'fair': 'text-yellow-400 bg-yellow-600/5 border-yellow-500/30',
    'strong': 'text-blue-400 bg-blue-600/5 border-blue-500/30',
    'very-strong': 'text-emerald-400 bg-emerald-600/5 border-emerald-500/30',
  };

  const strengthLabels = {
    'very-weak': 'Très faible',
    'weak': 'Faible',
    'fair': 'Moyen',
    'strong': 'Fort',
    'very-strong': 'Très fort',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Générateur de Mot de Passe
        </h1>
        <p className="text-slate-400 mt-1">
          Créez des mots de passe sécurisés avec validation en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-700">
            <button
              onClick={() => setShowManualInput(false)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                !showManualInput
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Générateur
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                showManualInput
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Vérifier Force
            </button>
          </div>

          {!showManualInput ? (
            <>
              {/* Password Display */}
              <Card title="Mot de passe généré">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={password}
                      readOnly
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-lg"
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
                    <div className={`px-4 py-3 rounded-lg border ${strengthColors[strength.label]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          Force: {strengthLabels[strength.label]}
                        </div>
                        <div className="text-sm">
                          Score: {strength.score}/4
                        </div>
                      </div>
                      {feedback.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {feedback.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={generatePassword}
                    disabled={loading}
                    className="w-full"
                  >
                    <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Génération...' : 'Générer'}
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Manual Password Check */}
              <Card title="Vérifier la force d'un mot de passe">
                <div className="space-y-4">
                  <textarea
                    value={manualPassword}
                    onChange={(e) => {
                      setManualPassword(e.target.value);
                      checkPasswordStrength(e.target.value);
                    }}
                    placeholder="Collez ou tapez votre mot de passe..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none h-20"
                  />

                  {strength && (
                    <div className={`px-4 py-3 rounded-lg border ${strengthColors[strength.label]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          Force: {strengthLabels[strength.label]}
                        </div>
                        <div className="text-sm">
                          Score: {strength.score}/4
                        </div>
                      </div>
                      {feedback.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {feedback.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              {strength.score >= 2 ? (
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                              )}
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Options - Only show in generator mode */}
          {!showManualInput && (
            <Card title="Options">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeUppercase}
                      onChange={() => toggleOption('includeUppercase')}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">
                      Majuscules (A-Z)
                    </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeLowercase}
                      onChange={() => toggleOption('includeLowercase')}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">
                      Minuscules (a-z)
                    </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeNumbers}
                      onChange={() => toggleOption('includeNumbers')}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">
                      Chiffres (0-9)
                    </span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeSymbols}
                      onChange={() => toggleOption('includeSymbols')}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm text-slate-300">
                      Symboles (!@#$%...)
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Length Slider - Only show in generator mode */}
        {!showManualInput && (
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
                <p className="text-sm text-slate-500 mt-1">
                  caractères
                </p>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>🔒 8-12: Basique</p>
                <p>🔐 12-16: Bon</p>
                <p>🔑 16+: Excellent</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

