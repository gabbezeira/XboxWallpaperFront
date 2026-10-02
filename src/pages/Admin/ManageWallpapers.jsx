import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Trash2,
  ChevronDown,
  CheckSquare,
  Square,
  X,
  Search,
  Tag,
} from 'lucide-react';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

export default function ManageWallpapers() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tag, setTag] = useState('');
  const [q, setQ] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [deletingId, setDeletingId] = useState(null);

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

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
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

  const confirmSingleDelete = async () => {
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
    } catch (err) {
      alert(`Erro ao excluir: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmBatchDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    setBatchModalOpen(false);
    setDeletingBatch(true);

    try {
      const res = await api.wallpapers.batchRemove(idsToDelete);
      const deletedSet = new Set(res.deleted || idsToDelete);
      setWallpapers((prev) => prev.filter((w) => !deletedSet.has(w.id)));
      setSelectedIds(new Set());
    } catch (err) {
      alert(`Erro ao excluir wallpapers: ${err.message}`);
    } finally {
      setDeletingBatch(false);
    }
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Acervo Público de Wallpapers</h2>
          <p className={styles.sectionSubtitle}>
            Navegue pelo catálogo público e realize exclusões individuais ou em lote.
          </p>
        </div>

        <div className={styles.toolbarActions}>
          {wallpapers.length > 0 && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={toggleSelectAll}
            >
              {selectedIds.size === wallpapers.length ? (
                <>
                  <CheckSquare size={15} />
                  <span>Desmarcar Todos ({wallpapers.length})</span>
                </>
              ) : (
                <>
                  <Square size={15} />
                  <span>Selecionar Todos ({wallpapers.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className={styles.filterToolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por título ou jogo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.searchBox}>
          <Tag size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Filtrar por tag..."
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button type="submit" className={styles.btnSecondary}>
          Filtrar
        </button>
      </form>

      {selectedIds.size > 0 && (
        <div className={styles.batchActionBar}>
          <span className={styles.batchActionText}>
            <CheckSquare size={16} />
            {selectedIds.size} {selectedIds.size === 1 ? 'wallpaper selecionado' : 'wallpapers selecionados'}
          </span>

          <div className={styles.batchActionButtons}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={clearSelection}
              disabled={deletingBatch}
            >
              Desmarcar
            </button>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => setBatchModalOpen(true)}
              disabled={deletingBatch}
            >
              <Trash2 size={15} />
              <span>{deletingBatch ? 'Excluindo...' : `Excluir Selecionados (${selectedIds.size})`}</span>
            </button>
          </div>
        </div>
      )}

      {loading && wallpapers.length === 0 ? (
        <Loader text="Carregando acervo..." />
      ) : wallpapers.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            Nenhum wallpaper encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className={styles.wallpapersGrid}>
          {wallpapers.map((w) => {
            const isSelected = selectedIds.has(w.id);
            const raw = w.thumbUrl || w.storageUrl || '';
            const thumbUrl = raw.startsWith('http')
              ? raw
              : `${API_URL}${raw.includes('thumb=true') ? raw : `${raw}${raw.includes('?') ? '&' : '?'}thumb=true`}`;

            return (
              <div
                key={w.id}
                className={`${styles.wpCard} ${isSelected ? styles.wpCardSelected : ''}`}
                onClick={(e) => toggleSelect(w.id, e)}
              >
                <div className={styles.wpImageWrapper}>
                  <img src={thumbUrl} alt="" className={styles.wpImage} loading="lazy" />
                  <div
                    className={styles.wpSelectCheckbox}
                    onClick={(e) => toggleSelect(w.id, e)}
                    title={isSelected ? 'Desmarcar' : 'Selecionar'}
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                </div>

                <div className={styles.wpCardInfo}>
                  <span className={styles.wpTitle} title={w.title || 'Sem título'}>
                    {w.title || 'Sem título'}
                  </span>
                  <button
                    type="button"
                    className={styles.wpDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmModal({ open: true, id: w.id });
                    }}
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && !loading && (
        <div className={styles.loadMoreContainer}>
          <button
            type="button"
            className={styles.btnLoadMore}
            onClick={handleLoadMore}
          >
            <span>Carregar mais</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {confirmModal.open && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal({ open: false, id: null })}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Excluir Wallpaper</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setConfirmModal({ open: false, id: null })}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.emptyText}>
                Tem certeza que deseja excluir este wallpaper do acervo público? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setConfirmModal({ open: false, id: null })}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmSingleDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {batchModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setBatchModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Excluir Wallpapers em Lote</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setBatchModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.emptyText}>
                Você selecionou <strong>{selectedIds.size} wallpapers</strong> para exclusão definitiva. Deseja prosseguir?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setBatchModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmBatchDelete}
                disabled={deletingBatch}
              >
                {deletingBatch ? 'Excluindo lote...' : `Confirmar Exclusão (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
