import { useEffect, useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Lock, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '../components/ui';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import { accountService } from '../services';
import { CATEGORY_LABELS } from '../utils/helpers';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [strengthFilter, setStrengthFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ total: 0, pages: 0, count: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const res = await accountService.getStats();
      setStats(res.data || null);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await accountService.getAll(params);
      let filteredAccounts = res.data.accounts || [];

      // Apply strength filter
      if (strengthFilter) {
        filteredAccounts = filteredAccounts.filter(acc => {
          if (strengthFilter === 'weak') return acc.passwordStrength?.score <= 1;
          if (strengthFilter === 'fair') return acc.passwordStrength?.score === 2;
          if (strengthFilter === 'strong') return acc.passwordStrength?.score >= 3;
          return true;
        });
      }

      // Apply sorting
      filteredAccounts = filteredAccounts.sort((a, b) => {
        switch (sortBy) {
          case 'strength':
            return (b.passwordStrength?.score || 0) - (a.passwordStrength?.score || 0);
          case 'age':
            return new Date(a.lastPasswordChange) - new Date(b.lastPasswordChange);
          case 'updated':
          default:
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
      });

      setAccounts(filteredAccounts);
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
    loadStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category, strengthFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(loadAccounts, 300);
    return () => clearTimeout(timer);
  }, [search, category, strengthFilter, sortBy, page]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await accountService.create(data);
      toast.success('Compte ajouté');
      setModalOpen(false);
      loadAccounts();
      loadStats();
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
      loadStats();
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
        _id: account._id,
        serviceName: res.data.account.serviceName,
        username: res.data.account.username,
        password: res.data.account.password,
        url: res.data.account.url || '',
        category: res.data.account.category,
        notes: res.data.account.notes || '',
        isFavorite: res.data.account.isFavorite || false,
      });
      setModalOpen(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleFavorite = async (account) => {
    try {
      await accountService.update(account._id, {
        isFavorite: !account.isFavorite,
      });
      toast.success(account.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
      loadAccounts();
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
      loadStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="animate-slide-in-down">
        <h1 className="text-2xl font-bold text-slate-100">Comptes</h1>
        <p className="text-slate-400 mt-1">Gérez et sécurisez tous vos identifiants</p>
      </div>

      {/* Stats Panel */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{stats.totalAccounts}</p>
              </div>
              <Lock className="w-6 h-6 text-brand-400 opacity-50" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Forts</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.strongPasswords}</p>
              </div>
              <Shield className="w-6 h-6 text-emerald-400 opacity-50" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Faibles</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.weakPasswords}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-400 opacity-50" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Sécurité</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.securityScore}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-400 opacity-50" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{pageInfo.total} compte(s) • Page {page} sur {pageInfo.pages}</p>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Ajouter un compte
        </Button>
      </div>

      {/* Filters */}
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
        <select
          value={strengthFilter}
          onChange={(e) => setStrengthFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">Toutes forces</option>
          <option value="weak">Faible</option>
          <option value="fair">Moyen</option>
          <option value="strong">Fort</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="updated">Récent</option>
          <option value="strength">Force</option>
          <option value="age">Âge du mot de passe</option>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-stagger">
            {accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
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

