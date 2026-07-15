import { useState } from 'react';
import { Download, Upload, FileJson, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button } from '../components/ui';
import { accountService } from '../services';

export default function DataManagement() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await accountService.exportData();
      
      const exportData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      if (!exportData || exportData.length === 0) {
        toast.error('No accounts to export');
        setExporting(false);
        return;
      }
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credenvault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Backup exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      
      await accountService.importData(data);
      toast.success('Data imported successfully');
      setShowConfirm(false);
      event.target.value = '';
    } catch (error) {
      toast.error('Invalid file format or import failed');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Gestion des Données
        </h1>
        <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
          Exportez et importez vos données de manière sécurisée
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <Card title="Exporter les Données">
          <div className="space-y-4">
            <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
              <p className="text-sm text-blue-300 font-medium mb-2">
                À propos de l'exportation
              </p>
              <p className="text-xs text-blue-200 leading-relaxed">
                Téléchargez une sauvegarde chiffrée de tous vos comptes et mots de passe. 
                Stockez-la en lieu sûr pour la récupération d'urgence.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
                Format de fichier
              </p>
              <div className="flex items-center gap-2 p-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg">
                <FileJson className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
                  JSON chiffré (.json)
                </span>
              </div>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={exporting}
              className="w-full"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportation...' : 'Télécharger la sauvegarde'}
            </Button>
          </div>
        </Card>

        {/* Import */}
        <Card title="Importer les Données">
          <div className="space-y-4">
            <div className="p-4 bg-orange-600/10 border border-orange-600/30 rounded-lg">
              <p className="text-sm text-orange-300 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Attention
              </p>
              <p className="text-xs text-orange-200 leading-relaxed">
                L'importation ajoutera les comptes du fichier à votre coffre. 
                Les comptes en doublon ne seront pas remplacés.
              </p>
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                as="div"
                disabled={importing}
                className="w-full cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {importing ? 'Importation...' : 'Sélectionner un fichier'}
              </Button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 text-center">
              Formats acceptés: JSON
            </p>
          </div>
        </Card>
      </div>

      {/* Safety Tips */}
      <Card title="Conseils de Sécurité">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg">
            <h4 className="text-sm font-medium text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">
              📁 Où stocker votre sauvegarde
            </h4>
            <ul className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 space-y-1">
              <li>✓ Stockage cloud privé (Google Drive, OneDrive)</li>
              <li>✓ Disque externe chiffré</li>
              <li>✓ Service cloud sécurisé</li>
              <li>✗ Email ou services non chiffrés</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg">
            <h4 className="text-sm font-medium text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">
              🔐 Meilleures pratiques
            </h4>
            <ul className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 space-y-1">
              <li>✓ Créer des sauvegardes régulières</li>
              <li>✓ Tester l'importation sur un compte test</li>
              <li>✓ Protéger les fichiers par mot de passe</li>
              <li>✓ Garder les sauvegardes à jour</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
