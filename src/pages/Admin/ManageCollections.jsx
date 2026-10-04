import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Star,
} from 'lucide-react';
import AdminHeader from './components/AdminHeader';
import AdminModal from './components/AdminModal';
import AdminBadge from './components/AdminBadge';
import styles from './styles.module.scss';

function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default function ManageCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    bannerUrl: '',
    creatorUid: '',
    featuredInHero: false,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCollections = async (bypassCache = false) => {
    try {
      setLoading(true);
      const data = await api.collections.list(bypassCache);
      setCollections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections(true);
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      code: '',
      description: '',
      bannerUrl: '',
      creatorUid: '',
      featuredInHero: false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingId(col.id);
    setFormData({
      name: col.name || '',
      slug: col.slug || '',
      code: col.code || '',
      description: col.description || '',
      bannerUrl: col.bannerUrl || '',
      creatorUid: col.creatorUid || '',
      featuredInHero: Boolean(col.featuredInHero),
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleNameChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingId ? prev.slug : generateSlug(val),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('O nome da coleção é obrigatório.');
      return;
    }
    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await api.collections.update(editingId, formData);
      } else {
        await api.collections.create(formData);
      }
      setModalOpen(false);
      fetchCollections(true);
    } catch (err) {
      setFormError(err.message || 'Erro ao salvar coleção.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    setDeleting(true);
    const targetId = collectionToDelete.id;
    try {
      await api.collections.remove(targetId);
      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);
      setCollections((prev) => prev.filter((col) => col.id !== targetId));
      fetchCollections(true);
    } catch (err) {
      if (err.message?.includes('não encontrada') || err.message?.includes('404')) {
        setDeleteConfirmOpen(false);
        setCollectionToDelete(null);
        setCollections((prev) => prev.filter((col) => col.id !== targetId));
        fetchCollections(true);
      } else {
        alert(`Erro ao excluir: ${err.message}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const filteredCollections = collections.filter((col) => {
    const q = searchQuery.toLowerCase();
    return (
      (col.name || '').toLowerCase().includes(q) ||
      (col.slug || '').toLowerCase().includes(q) ||
      (col.description || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <Loader text="Carregando coleções..." />;
  }

  return (
    <div className={styles.viewContainer}>
      <AdminHeader
        title="Gestão de Coleções"
        subtitle="Organize os wallpapers oficiais por jogos, franquias e coleções de criadores."
        badge={collections.length > 0 ? `${collections.length} coleções` : null}
      >
        <div className={styles.toolbarActions}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar coleções..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            <span>Nova Coleção</span>
          </button>
        </div>
      </AdminHeader>

      {filteredCollections.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={44} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Nenhuma Coleção Encontrada</h3>
          <p className={styles.emptyText}>
            {searchQuery
              ? 'Nenhuma coleção corresponde aos termos pesquisados.'
              : 'Nenhuma coleção criada ainda. Comece criando a primeira coleção acima.'}
          </p>
        </div>
      ) : (
        <div className={styles.collectionsGrid}>
          {filteredCollections.map((col) => (
            <div key={col.id} className={styles.collectionCard}>
              <div className={styles.collectionBannerWrapper}>
                {col.bannerUrl ? (
                  <img src={col.bannerUrl} alt="" className={styles.collectionBanner} />
                ) : (
                  <div className={styles.collectionBannerPlaceholder}>
                    <Layers size={32} />
                  </div>
                )}
                {col.featuredInHero && (
                  <div className={styles.heroBadgeWrapper}>
                    <AdminBadge variant="xbox" icon={Star}>Destaque Hero</AdminBadge>
                  </div>
                )}
              </div>

              <div className={styles.collectionCardBody}>
                <h3 className={styles.collectionName}>{col.name}</h3>
                <span className={styles.collectionSlug}>
                  /{col.slug} • Código: {col.code || col.slug?.toUpperCase()}
                </span>
                {col.description && (
                  <p className={styles.collectionDesc}>{col.description}</p>
                )}
              </div>

              <div className={styles.collectionCardFooter}>
                <a
                  href={`/collection/${col.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btnIconSmall}
                  title="Ver coleção no site"
                >
                  <ExternalLink size={15} />
                </a>

                <button
                  type="button"
                  className={styles.btnIconSmall}
                  onClick={() => handleOpenEdit(col)}
                  title="Editar coleção"
                >
                  <Edit2 size={15} />
                </button>

                <button
                  type="button"
                  className={styles.btnDangerIconSmall}
                  onClick={() => {
                    setCollectionToDelete(col);
                    setDeleteConfirmOpen(true);
                  }}
                  title="Excluir coleção"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AdminModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Editar Coleção' : 'Nova Coleção'}
        >
          <form onSubmit={handleSave}>
            <div className={styles.modalBody}>
              {formError && (
                <div className={styles.batchActionText}>
                  <span>{formError}</span>
                </div>
              )}

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Nome da Coleção</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Halo Infinite Collection"
                  className={styles.fieldInput}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Slug (URL amigável)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  placeholder="Ex: halo-infinite"
                  className={styles.fieldInput}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Código de Busca Rápida (opcional)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: XB-HALO (gerado automaticamente do slug se vazio)"
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição para a comunidade..."
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>URL do Banner (16:9)</label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, bannerUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Creator UID (opcional)</label>
                <input
                  type="text"
                  value={formData.creatorUid}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorUid: e.target.value })
                  }
                  placeholder="UID do usuário criador da coleção..."
                  className={styles.fieldInput}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={saving}
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Coleção'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {deleteConfirmOpen && (
        <AdminModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Excluir Coleção"
        >
          <div className={styles.modalBody}>
            <p className={styles.emptyText}>
              Tem certeza que deseja excluir a coleção &quot;{collectionToDelete?.name}&quot;? Todos os wallpapers associados a ela também serão excluídos definitivamente do acervo e do armazenamento.
            </p>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir Coleção'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
