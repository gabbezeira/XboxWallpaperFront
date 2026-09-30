import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Layers, Plus, Edit2, Trash2, ExternalLink, Image, Search, User, Star } from 'lucide-react';
import styles from './styles.module.scss';

function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
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
        await api.collections.update(editingId, {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          bannerUrl: formData.bannerUrl.trim(),
          creatorUid: formData.creatorUid.trim() || null,
          featuredInHero: formData.featuredInHero,
        });
      } else {
        await api.collections.create({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          bannerUrl: formData.bannerUrl.trim(),
          creatorUid: formData.creatorUid.trim() || null,
          featuredInHero: formData.featuredInHero,
        });
      }
      setModalOpen(false);
      await fetchCollections();
    } catch (err) {
      setFormError(err.message || 'Erro ao salvar coleção');
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
      await fetchCollections();
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = collections.filter((c) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = c.name && c.name.toLowerCase().includes(q);
    const slugMatch = c.slug && c.slug.toLowerCase().includes(q);
    const descMatch = c.description && c.description.toLowerCase().includes(q);
    return nameMatch || slugMatch || descMatch;
  });

  return (
    <div className={styles.collectionsSection}>
      <div className={styles.collectionsHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Gestão de Coleções</h2>
          <p className={styles.sectionSubtitle}>
            Crie, edite e vincule coleções oficiais a criadores de conteúdo e ao Hero Slide.
          </p>
        </div>
        <div className={styles.headerRightActions}>
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
          <button type="button" onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} /> Nova Coleção
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadRow}>
          <Loader />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyQueue}>
          <Layers size={40} className={styles.emptyQueueIcon} />
          <h3 className={styles.emptyQueueTitle}>Nenhuma coleção encontrada</h3>
          <p className={styles.emptyQueueText}>
            {searchQuery ? 'Nenhum resultado para os termos buscados.' : 'Comece criando a primeira coleção acima.'}
          </p>
        </div>
      ) : (
        <div className={styles.collectionsGrid}>
          {filtered.map((col) => (
            <div key={col.id} className={styles.collectionCard}>
              <div className={styles.colBannerBox}>
                {col.bannerUrl ? (
                  <img src={col.bannerUrl} alt={col.name} className={styles.colBannerImg} />
                ) : (
                  <div className={styles.colBannerPlaceholder}>
                    <Image size={32} />
                  </div>
                )}
                {col.featuredInHero && (
                  <span className={styles.heroPill}>
                    <Star size={12} /> Destaque Hero
                  </span>
                )}
              </div>
              <div className={styles.colBody}>
                <div className={styles.colInfo}>
                  <h3 className={styles.colTitle}>{col.name}</h3>
                  <span className={styles.colSlug}>/c/{col.slug}</span>
                  {col.description && <p className={styles.colDesc}>{col.description}</p>}
                </div>
                {col.creatorUid && (
                  <div className={styles.colCreatorTag}>
                    <User size={13} />
                    <span>UID: {col.creatorUid}</span>
                  </div>
                )}
                <div className={styles.colCardActions}>
                  <a
                    href={`/c/${col.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.colActionBtn}
                    title="Ver Coleção Pública"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(col)}
                    className={styles.colActionBtn}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCollectionToDelete(col);
                      setDeleteConfirmOpen(true);
                    }}
                    className={styles.colActionDanger}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.collectionModal}>
            <h3 className={styles.modalTitle}>
              {editingId ? 'Editar Coleção' : 'Criar Nova Coleção'}
            </h3>
            {formError && <div className={styles.errorBanner}>{formError}</div>}
            <form onSubmit={handleSave} className={styles.collectionForm}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Nome da Coleção *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cyberpunk 2077 Essentials"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Identificador (Slug) *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: cyberpunk-2077"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Descrição</label>
                <textarea
                  placeholder="Breve resumo da coleção para os visitantes..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className={styles.textareaInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>URL do Banner (16:9)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>UID do Criador Associado (Opcional)</label>
                <input
                  type="text"
                  placeholder="ID do usuário para transformá-lo em Playlist"
                  value={formData.creatorUid}
                  onChange={(e) => setFormData((prev) => ({ ...prev, creatorUid: e.target.value }))}
                  className={styles.fieldInput}
                />
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.featuredInHero}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featuredInHero: e.target.checked }))}
                  className={styles.checkboxInput}
                />
                <span>Destacar coleção na página principal / Hero</span>
              </label>

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles.btnGhost}
                  disabled={saving}
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

      {deleteConfirmOpen && collectionToDelete && (
        <Modal
          isOpen={deleteConfirmOpen}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a coleção "${collectionToDelete.name}"? Os wallpapers continuarão no acervo geral, mas perderão o vínculo com esta coleção.`}
          variant="danger"
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
