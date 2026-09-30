import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Trash2,
  Loader2,
  ChevronDown,
  Check,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import Modal from '../../components/Modal';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

export default function ManageWallpapers() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [tag, setTag] = useState('');
  const [q, setQ] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    variant: 'success',
  });

  const fetchWallpapers = async (pageNum = 1, append = false, currentQ = q, currentTag = tag) => {
    try {
      setLoading(true);
      const res = await api.wallpapers.list({
        page: pageNum,
        limit: 20,
        q: currentQ,
        tag: currentTag,
      });

      if (res.data) {
        if (append) {
          setWallpapers((prev) => [...prev, ...res.data]);
        } else {
          setWallpapers(res.data);
          setSelectedIds(new Set());
        }
        setHasMore(res.data.length === 20);
      }
    } catch (error) {
      console.error('Erro ao buscar wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers(1, false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWallpapers(1, false, q, tag);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWallpapers(nextPage, true, q, tag);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === wallpapers.length && wallpapers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(wallpapers.map((w) => w.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const promptDelete = (id) => {
    setConfirmModal({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    setDeletingId(id);

    try {
      await api.wallpapers.remove(id);
      setWallpapers((prev) => prev.filter((w) => w.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setAlertModal({
        open: true,
        title: 'Excluído',
        message: 'Wallpaper removido com sucesso.',
        variant: 'success',
      });
    } catch {
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Não foi possível excluir o wallpaper.',
        variant: 'danger',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ open: false, id: null });
  };

  const promptDeleteBatch = () => {
    if (selectedIds.size === 0) return;
    setBatchModalOpen(true);
  };

  const confirmDeleteBatch = async () => {
    const idsToDelete = Array.from(selectedIds);
    setBatchModalOpen(false);
    setDeletingBatch(true);

    try {
      const res = await api.wallpapers.batchRemove(idsToDelete);
      const deletedSet = new Set(res.deleted || idsToDelete);
      setWallpapers((prev) => prev.filter((w) => !deletedSet.has(w.id)));
      setSelectedIds(new Set());
      setAlertModal({
        open: true,
        title: 'Excluídos com sucesso',
        message: `${deletedSet.size} wallpaper(s) removido(s) do acervo.`,
        variant: 'success',
      });
    } catch {
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Não foi possível excluir os wallpapers selecionados.',
        variant: 'danger',
      });
    } finally {
      setDeletingBatch(false);
    }
  };

  return (
    <div className={styles.manage}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderText}>
          <h2 className={styles.listHeaderTitle}>Wallpapers públicos</h2>
          {wallpapers.length > 0 && (
            <button
              type="button"
              className={styles.btnSelectAllHeader}
              onClick={toggleSelectAll}
            >
              {selectedIds.size === wallpapers.length ? (
                <>
                  <CheckSquare size={15} />
                  <span>Desmarcar todos ({wallpapers.length})</span>
                </>
              ) : (
                <>
                  <Square size={15} />
                  <span>Selecionar todos ({wallpapers.length})</span>
                </>
              )}
            </button>
          )}
        </div>
        <form onSubmit={handleSearch} className={styles.listHeaderForm}>
          <input
            type="text"
            placeholder="Buscar título ou jogo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles.listHeaderField}
            aria-label="Buscar título ou jogo"
          />
          <input
            type="text"
            placeholder="Filtrar por tag..."
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className={styles.listHeaderField}
            aria-label="Filtrar por tag"
          />
          <button type="submit" className={styles.listHeaderBtn}>
            Filtrar
          </button>
        </form>
      </div>

      {wallpapers.length === 0 && !loading && (
        <p className={styles.listEmpty}>Nenhum wallpaper encontrado.</p>
      )}

      {wallpapers.length > 0 && (
        <div className={styles.mediaGrid}>
          {wallpapers.map((wall) => {
            const thumbSrc = wall.thumbUrl?.startsWith('http')
              ? wall.thumbUrl
              : `${API_URL}${wall.thumbUrl || wall.storageUrl}`;
            const isSelected = selectedIds.has(wall.id);

            return (
              <div
                key={wall.id}
                className={`${styles.mediaItem} ${isSelected ? styles.mediaItemSelected : ''}`}
                onClick={() => toggleSelect(wall.id)}
              >
                <button
                  type="button"
                  className={`${styles.mediaItemCheckbox} ${isSelected ? styles.mediaItemCheckboxChecked : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(wall.id);
                  }}
                  aria-label={isSelected ? 'Desmarcar' : 'Selecionar'}
                >
                  {isSelected && <Check size={14} />}
                </button>

                <img
                  src={thumbSrc}
                  alt={wall.title || 'Wallpaper'}
                  loading="lazy"
                  className={styles.mediaItemImg}
                />
                <div className={styles.mediaItemOverlay}>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={(e) => {
                      e.stopPropagation();
                      promptDelete(wall.id);
                    }}
                    disabled={deletingId === wall.id || deletingBatch}
                    title="Excluir wallpaper"
                    aria-label="Excluir wallpaper"
                  >
                    {deletingId === wall.id ? (
                      <Loader2 size={18} className={styles.spin} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className={styles.batchBar}>
          <div className={styles.batchInfo}>
            <CheckSquare size={18} />
            <span>{selectedIds.size} selecionado(s)</span>
          </div>
          <div className={styles.batchActions}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={toggleSelectAll}
            >
              {selectedIds.size === wallpapers.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={clearSelection}
              aria-label="Limpar seleção"
            >
              <X size={16} />
              <span>Limpar</span>
            </button>
            <button
              type="button"
              className={styles.btnDangerFull}
              onClick={promptDeleteBatch}
              disabled={deletingBatch}
            >
              {deletingBatch ? (
                <Loader2 size={16} className={styles.spin} />
              ) : (
                <Trash2 size={16} />
              )}
              <span>Excluir selecionados ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadRow} aria-live="polite" aria-busy="true">
          <Loader2 size={24} className={styles.spin} />
        </div>
      )}

      {hasMore && !loading && wallpapers.length > 0 && (
        <div className={styles.listFooter}>
          <button type="button" className={styles.btnGhost} onClick={handleLoadMore}>
            Carregar mais <ChevronDown size={16} aria-hidden />
          </button>
        </div>
      )}

      <Modal
        isOpen={confirmModal.open}
        title="Excluir wallpaper"
        message="Excluir permanentemente este wallpaper? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <Modal
        isOpen={batchModalOpen}
        title="Excluir wallpapers selecionados"
        message={`Tem certeza que deseja excluir permanentemente os ${selectedIds.size} wallpapers selecionados? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDeleteBatch}
        onCancel={() => setBatchModalOpen(false)}
        confirmText="Excluir Selecionados"
        cancelText="Cancelar"
        variant="danger"
      />

      <Modal
        isOpen={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => setAlertModal((prev) => ({ ...prev, open: false }))}
        confirmText="OK"
        variant={alertModal.variant}
      />
    </div>
  );
}
