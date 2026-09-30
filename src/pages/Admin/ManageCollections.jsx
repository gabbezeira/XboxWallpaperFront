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
  X,
} from 'lucide-react';
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

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await api.collections.list();
      setCollections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
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
      fetchCollections();
    } catch (err) {
      setFormError(err.message || 'Erro ao salvar coleção.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    setDeleting(true);
    try {
      await api.collections.remove(collectionToDelete.id);
      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);
      fetchCollections();
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
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
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Gestão de Coleções</h2>
          <p className={styles.sectionSubtitle}>
            Organize os wallpapers oficiais por jogos, franquias e playlists de criadores.
          </p>
        </div>

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
      </div>

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
                  <span className={styles.heroFeaturedPill}>
                    <Star size={11} />
                    <span>Destaque Hero</span>
                  </span>
                )}
              </div>

              <div className={styles.collectionCardBody}>
                <h3 className={styles.collectionName}>{col.name}</h3>
                <span className={styles.collectionSlug}>/{col.slug}</span>
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
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingId ? 'Editar Coleção' : 'Nova Coleção'}
              </h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

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
                    placeholder="UID do usuário criador da playlist..."
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
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Excluir Coleção</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setDeleteConfirmOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
