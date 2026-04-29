import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Trash2, Loader2, ChevronDown } from 'lucide-react';
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

  return (
    <div className={styles.manage}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderText}>
          <h2 className={styles.listHeaderTitle}>Wallpapers públicos</h2>
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

            return (
              <div key={wall.id} className={styles.mediaItem}>
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
                    onClick={() => promptDelete(wall.id)}
                    disabled={deletingId === wall.id}
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
