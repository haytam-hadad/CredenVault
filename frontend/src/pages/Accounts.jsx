import { useEffect, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '../components/ui';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import { accountService } from '../services';
import { CATEGORY_LABELS } from '../utils/helpers';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ total: 0, pages: 0, count: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await accountService.getAll(params);
      setAccounts(res.data.accounts || []);
      setPageInfo({
        total: res.data.total || 0,
        pages: res.data.pages || 1,
        count: res.data.count || 0,
      });
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(loadAccounts, 300);
    return () => clearTimeout(timer);
  }, [search, category, page]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await accountService.create(data);
      toast.success('Compte ajouté');
      setModalOpen(false);
      loadAccounts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await accountService.update(editing._id, data);
      toast.success('Compte mis à jour');
      setModalOpen(false);
      setEditing(null);
      loadAccounts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (account) => {
    try {
      const res = await accountService.getOne(account._id);
      setEditing({
        serviceName: res.data.account.serviceName,
        username: res.data.account.username,
        password: res.data.account.password,
        url: res.data.account.url || '',
        category: res.data.account.category,
        notes: res.data.account.notes || '',
      });
      setModalOpen(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Supprimer le compte "${account.serviceName}" ?`)) return;
    try {
      await accountService.delete(account._id);
      toast.success('Compte supprimé');
      loadAccounts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-bold text-slate-100">Mes comptes</h1>
          </div>
          <p className="text-slate-400 mt-1">{pageInfo.total} compte(s) enregistré(s) • Page {page} sur {pageInfo.pages}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Ajouter un compte
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un service ou identifiant..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">Toutes catégories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Chargement de vos comptes...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Lock className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
          <p className="text-slate-500 mb-4">
            {search || category ? 'Aucun compte correspond à votre recherche' : 'Aucun compte enregistré'}
          </p>
          {!search && !category && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Ajouter votre premier compte
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {pageInfo.pages > 1 && (
            <div className="flex items-center justify-between glass-card p-4">
              <div className="text-sm text-slate-400">
                Affichage {(page - 1) * 12 + 1}-{Math.min(page * 12, pageInfo.total)} sur {pageInfo.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm font-medium">
                  {page} / {pageInfo.pages}
                </div>
                <Button
                  onClick={() => setPage(p => Math.min(pageInfo.pages, p + 1))}
                  disabled={page === pageInfo.pages}
                  className="px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Modifier le compte' : 'Nouveau compte'}
        size="lg"
      >
        <AccountForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
