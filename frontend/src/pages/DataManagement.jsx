import { useEffect, useRef, useState } from 'react';  
import { Download, Upload, FileJson, AlertTriangle, Database } from 'lucide-react';  
import toast from 'react-hot-toast';  
import { Card, Button, Modal } from '../components/ui';  
import { useReauth } from '../components/auth/ReAuthContext';  
import { accountService } from '../services';  
  
const normalizeImportPayload = (parsed) => {  
  if (Array.isArray(parsed)) return parsed;  
  if (Array.isArray(parsed?.accounts)) return parsed.accounts;  
  if (Array.isArray(parsed?.data?.accounts)) return parsed.data.accounts;  
  if (Array.isArray(parsed?.data)) return parsed.data;  
  return null;  
};  
  
export default function DataManagement() {  
  const { requireReauth } = useReauth();  
  const fileInputRef = useRef(null);  
  const [accountCount, setAccountCount] = useState(null);  
  const [exporting, setExporting] = useState(false);  
  const [importing, setImporting] = useState(false);  
  const [pendingImport, setPendingImport] = useState(null);  
  const [showConfirm, setShowConfirm] = useState(false);  
  
  useEffect(() => {  
    accountService  
      .getAll()  
      .then((res) => setAccountCount(res.data?.accounts?.length ?? 0))  
      .catch(() => setAccountCount(0));  
  }, []);  
  
  const handleExport = () => {  
    // Exporting downloads every decrypted password, so gate it behind re-auth.  
    requireReauth(  
      async () => {  
        try {  
          setExporting(true);  
          const res = await accountService.exportData();  
          const payload = res.data?.accounts != null ? res.data : { accounts: res.data || [] };  
          const accounts = payload.accounts || [];  
  
          const exportFile = {  
            version: payload.version || 1,  
            exportedAt: payload.exportedAt || new Date().toISOString(),  
            accountCount: accounts.length,  
            accounts,  
          };  
  
          const dataStr = JSON.stringify(exportFile, null, 2);  
          const dataBlob = new Blob([dataStr], { type: 'application/json' });  
          const url = URL.createObjectURL(dataBlob);  
          const link = document.createElement('a');  
          link.href = url;  
          link.download = `credenvault-backup-${new Date().toISOString().split('T')[0]}.json`;  
          document.body.appendChild(link);  
          link.click();  
          document.body.removeChild(link);  
          URL.revokeObjectURL(url);  
  
          toast.success(  
            accounts.length  
              ? `${accounts.length} compte(s) exporté(s)`  
              : 'Sauvegarde vide exportée'  
          );  
        } catch (error) {  
          toast.error(error.message || "Échec de l'exportation");  
        } finally {  
          setExporting(false);  
        }  
      },  
      {  
        title: 'Exporter les données',  
        description: 'Confirmez votre identité pour télécharger une sauvegarde de tous vos mots de passe.',  
        actionLabel: 'Exporter',  
      }  
    );  
  };  
  
  const handleFileSelect = async (event) => {  
    const file = event.target.files?.[0];  
    if (!file) return;  
  
    try {  
      const text = await file.text();  
      const parsed = JSON.parse(text);  
      const accounts = normalizeImportPayload(parsed);  
  
      if (!accounts?.length) {  
        toast.error('Fichier invalide ou vide');  
        return;  
      }  
  
      const invalid = accounts.find(  
        (acc) => !acc.serviceName?.trim() || !acc.username?.trim() || !acc.password  
      );  
      if (invalid) {  
        toast.error('Chaque compte doit avoir un service, un identifiant et un mot de passe');  
        return;  
      }  
  
      setPendingImport(accounts);  
      setShowConfirm(true);  
    } catch {  
      toast.error('Format de fichier JSON invalide');  
    } finally {  
      event.target.value = '';  
    }  
  };  
  
  const handleImportConfirm = async () => {  
    if (!pendingImport?.length) return;  
  
    try {  
      setImporting(true);  
      const res = await accountService.importData({ accounts: pendingImport });  
      toast.success(res.message || 'Importation réussie');  
  
      const countRes = await accountService.getAll();  
      setAccountCount(countRes.data?.accounts?.length ?? 0);  
  
      setShowConfirm(false);  
      setPendingImport(null);  
    } catch (error) {  
      toast.error(error.message || "Échec de l'importation");  
    } finally {  
      setImporting(false);  
    }  
  };  
  
  return (  
    <div className="space-y-6 animate-fade-in">  
      <div>  
        <h1 className="text-2xl font-bold text-slate-100">Gestion des données</h1>  
        <p className="text-slate-400 mt-1">  
          Exportez et importez vos comptes de manière sécurisée  
        </p>  
        {accountCount !== null && (  
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">  
            <Database className="w-4 h-4" />  
            {accountCount} compte(s) actuellement enregistré(s)  
          </p>  
        )}  
      </div>  
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">  
        <Card title="Exporter les données">  
          <div className="space-y-4">  
            <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">  
              <p className="text-sm text-blue-600 font-medium mb-2">À propos de l&apos;exportation</p>  
              <p className="text-xs text-blue-500 leading-relaxed">  
                Téléchargez une sauvegarde JSON de tous vos comptes (mots de passe déchiffrés).  
                Conservez ce fichier dans un emplacement sûr et chiffré.  
              </p>  
            </div>  
  
            <div className="space-y-2">  
              <p className="text-sm font-medium text-slate-300">Format de fichier</p>  
              <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg">  
                <FileJson className="w-5 h-5 text-yellow-500" />  
                <span className="text-sm text-slate-400">JSON (.json)</span>  
              </div>  
            </div>  
  
            <Button onClick={handleExport} loading={exporting} className="w-full">  
              <Download className="w-4 h-4" />  
              Télécharger la sauvegarde  
            </Button>  
          </div>  
        </Card>  
  
        <Card title="Importer les données">  
          <div className="space-y-4">  
            <div className="p-4 bg-orange-600/10 border border-orange-600/30 rounded-lg">  
              <p className="text-sm text-orange-500 font-medium mb-2 flex items-center gap-2">  
                <AlertTriangle className="w-4 h-4" />  
                Attention  
              </p>  
              <p className="text-xs text-orange-400 leading-relaxed">  
                L&apos;importation ajoute les comptes du fichier à votre coffre.  
                Les doublons (même service + identifiant) sont ignorés automatiquement.  
              </p>  
            </div>  
  
            <input  
              ref={fileInputRef}  
              type="file"  
              accept=".json,application/json"  
              onChange={handleFileSelect}  
              className="hidden"  
            />  
            <Button  
              type="button"  
              variant="secondary"  
              loading={importing}  
              className="w-full"  
              onClick={() => fileInputRef.current?.click()}  
            >  
              <Upload className="w-4 h-4" />  
              Sélectionner un fichier  
            </Button>  
  
            <p className="text-xs text-slate-500 text-center">Formats acceptés : JSON</p>  
          </div>  
        </Card>  
      </div>  
  
      <Card title="Conseils de sécurité">  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
          <div className="p-4 bg-slate-800 rounded-lg">  
            <h4 className="text-sm font-medium text-slate-100 mb-2">Où stocker votre sauvegarde</h4>  
            <ul className="text-xs text-slate-400 space-y-1">  
              <li>Stockage cloud privé (Google Drive, OneDrive)</li>  
              <li>Disque externe chiffré</li>  
              <li>Service cloud sécurisé</li>  
              <li>Évitez l&apos;email ou les services non chiffrés</li>  
            </ul>  
          </div>  
          <div className="p-4 bg-slate-800 rounded-lg">  
            <h4 className="text-sm font-medium text-slate-100 mb-2">Meilleures pratiques</h4>  
            <ul className="text-xs text-slate-400 space-y-1">  
              <li>Créez des sauvegardes régulières</li>  
              <li>Testez l&apos;importation sur un compte test</li>  
              <li>Protégez les fichiers par mot de passe</li>  
              <li>Gardez les sauvegardes à jour</li>  
            </ul>  
          </div>  
        </div>  
      </Card>  
  
      <Modal  
        isOpen={showConfirm}  
        onClose={() => {  
          if (!importing) {  
            setShowConfirm(false);  
            setPendingImport(null);  
          }  
        }}  
        title="Confirmer l'importation"  
      >  
        <div className="space-y-4">  
          <p className="text-sm text-slate-400">  
            Vous allez importer{' '}  
            <strong className="text-white">{pendingImport?.length || 0}</strong> compte(s).  
            Les doublons existants seront ignorés.  
          </p>  
          <div className="flex gap-3">  
            <Button onClick={handleImportConfirm} loading={importing} className="flex-1">  
              Importer  
            </Button>  
            <Button  
              variant="secondary"  
              onClick={() => {  
                setShowConfirm(false);  
                setPendingImport(null);  
              }}  
              disabled={importing}  
            >  
              Annuler  
            </Button>  
          </div>  
        </div>  
      </Modal>  
    </div>  
  );  
}