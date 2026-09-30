import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { getCached } from '../../services/apiCache';
import WallpaperGrid from '../../components/WallpaperGrid';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import {
  Search,
  X,
  SlidersHorizontal,
  Tag,
  ImageOff,
} from 'lucide-react';
import styles from './styles.module.scss';

function getGalleryCached(q, activeTag, currentSort, page) {
  const sort = currentSort === 'popular' ? 'popular' : '';
  const tag = activeTag !== 'Tudo' ? activeTag : '';
  const cached = getCached('/api/wallpapers', { q, tag, sort, page, limit: 12 });
  return cached;
}

export default function Gallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const activeTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const initialCache = getGalleryCached(q, activeTag, currentSort, page);
  const cachedTags = getCached('/api/wallpapers/tags');

  const [availableTags, setAvailableTags] = useState(() => cachedTags?.tags || []);
  const [wallpapers, setWallpapers] = useState(() => initialCache?.data || []);
  const [loading, setLoading] = useState(() => !initialCache?.data?.length);
  const [totalPages, setTotalPages] = useState(() => initialCache?.totalPages || 1);
  const [totalItems, setTotalItems] = useState(() => initialCache?.totalItems || 0);

  const [localSearch, setLocalSearch] = useState(q);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  useEffect(() => {
    if (tagModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [tagModalOpen]);

  useEffect(() => {
    if (!tagModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTagModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tagModalOpen]);

  const handleOpenModal = () => {
    setTagSearchQuery('');
    setTagModalOpen(true);
  };

  const handleCloseModal = () => {
    setTagSearchQuery('');
    setTagModalOpen(false);
  };

  useEffect(() => {
    let isMounted = true;
    api.wallpapers
      .tags()
      .then((res) => {
        if (!isMounted || !res) return;
        setAvailableTags(res.tags || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const res = await api.wallpapers.list({
          q,
          tag: activeTag !== 'Tudo' ? activeTag : '',
          sort: currentSort === 'popular' ? 'popular' : '',
          page,
          limit: 12,
        });
        if (isMounted) {
          setWallpapers(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalItems(res.totalItems || 0);
        }
      } catch (error) {
        if (isMounted) console.error('Erro ao buscar galeria:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWallpapers();

    return () => {
      isMounted = false;
    };
  }, [q, activeTag, currentSort, page]);

  useEffect(() => {
    setLocalSearch(q);
  }, [q]);

  const displayedChips = useMemo(() => {
    if (!activeTag) return availableTags.slice(0, 30);
    const normalizedActive = activeTag.toLowerCase();
    const activeIndex = availableTags.findIndex(
      (t) => t.name.toLowerCase() === normalizedActive
    );
    if (activeIndex > -1) {
      const activeItem = availableTags[activeIndex];
      const otherTags = availableTags.filter((_, idx) => idx !== activeIndex);
      return [activeItem, ...otherTags].slice(0, 30);
    }
    return [{ name: activeTag, count: '' }, ...availableTags].slice(0, 30);
  }, [availableTags, activeTag]);

  const modalFilteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return availableTags;
    const queryLower = tagSearchQuery.trim().toLowerCase();
    return availableTags.filter((t) => t.name.toLowerCase().includes(queryLower));
  }, [availableTags, tagSearchQuery]);

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
  };

  const handleSelectAll = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tag');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleTagSelect = (tagToSet) => {
    const newParams = new URLSearchParams(searchParams);
    if (activeTag.toLowerCase() === tagToSet.toLowerCase()) {
      newParams.delete('tag');
    } else {
      newParams.set('tag', tagToSet);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setTagModalOpen(false);
  };

  const handleSortToggle = (sortMode) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortMode === 'popular') {
      newParams.set('sort', 'popular');
    } else {
      newParams.delete('sort');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      newParams.set('q', localSearch.trim());
    } else {
      newParams.delete('q');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  const hasActiveFilters = Boolean(q || activeTag || currentSort === 'popular');

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Explorar</h1>
            <p className={styles.subtitle}>Encontre os melhores wallpapers para seu Xbox</p>
          </div>

          <form className={styles.mobileSearch} onSubmit={handleMobileSearch}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar wallpapers..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        </div>

        <div className={styles.filtersSection}>
          <div className={styles.firstLineBar}>
            <div className={styles.firstLineActions}>
              <button
                type="button"
                className={`${styles.filterPillBtn} ${!activeTag ? styles.active : ''}`}
                onClick={handleSelectAll}
              >
                <span>Todos</span>
              </button>

              <button
                type="button"
                className={`${styles.filterPillBtn} ${currentSort !== 'popular' ? styles.active : ''}`}
                onClick={() => handleSortToggle('recent')}
              >
                <span>Recentes</span>
              </button>

              <button
                type="button"
                className={`${styles.filterPillBtn} ${currentSort === 'popular' ? styles.active : ''}`}
                onClick={() => handleSortToggle('popular')}
              >
                <span>Populares</span>
              </button>
            </div>

            <button
              type="button"
              className={styles.btnOpenModal}
              onClick={handleOpenModal}
              title="Filtrar por tags"
            >
              <SlidersHorizontal size={14} />
              <span>Filtrar</span>
            </button>
          </div>

          <div className={styles.chipsContainer}>
            {displayedChips.map((t) => {
              const isSelected = activeTag.toLowerCase() === t.name.toLowerCase();
              return (
                <button
                  key={t.name}
                  type="button"
                  className={`${styles.tagChip} ${isSelected ? styles.active : ''}`}
                  onClick={() => handleTagSelect(t.name)}
                >
                  <span>{t.name}</span>
                  <span className={styles.tagCount}>{t.count}</span>
                </button>
              );
            })}
          </div>

        </div>

        {loading ? (
          <Loader text="Buscando wallpapers..." />
        ) : wallpapers.length > 0 ? (
          <>
            <WallpaperGrid
              wallpapers={wallpapers}
              onView={handleViewDetails}
              maxColumns={6}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className={styles.empty}>
            <ImageOff size={42} className={styles.emptyIcon} />
            <p>Nenhum wallpaper encontrado para os filtros selecionados.</p>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.btnClearFilters}
                onClick={handleClearAll}
              >
                Limpar filtros e ver catálogo completo
              </button>
            )}
          </div>
        )}
      </div>

      {tagModalOpen &&
        createPortal(
          <div
            className={styles.modalOverlay}
            onClick={handleCloseModal}
          >
            <div
              className={styles.modalCard}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCloseModal}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Filtrar por Tags</h2>
                <p className={styles.modalSubtitle}>
                  Selecione uma tag para refinar os wallpapers
                </p>
              </div>

              <div className={styles.modalSearchArea}>
                <div className={styles.modalSearchInput}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Pesquisar tags..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {tagSearchQuery && (
                    <button
                      type="button"
                      className={styles.modalClearSearchBtn}
                      onClick={() => setTagSearchQuery('')}
                      aria-label="Limpar pesquisa"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.modalTagsBody}>
                {modalFilteredTags.length === 0 ? (
                  <div className={styles.modalEmpty}>
                    <p>Nenhuma tag encontrada para &quot;{tagSearchQuery}&quot;</p>
                  </div>
                ) : (
                  modalFilteredTags.map((t) => {
                    const isSelected = activeTag.toLowerCase() === t.name.toLowerCase();
                    return (
                      <button
                        key={t.name}
                        type="button"
                        className={`${styles.modalTagChip} ${isSelected ? styles.active : ''}`}
                        onClick={() => handleTagSelect(t.name)}
                      >
                        <Tag size={12} />
                        <span>{t.name}</span>
                        <span className={styles.modalTagCount}>{t.count}</span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.modalFooterMeta}>
                  {activeTag ? (
                    <span>Tag ativa: <strong>{activeTag}</strong></span>
                  ) : (
                    <span>{availableTags.length} tags disponíveis</span>
                  )}
                </div>

                <div className={styles.modalFooterActions}>
                  {activeTag && (
                    <button
                      type="button"
                      className={styles.btnModalClear}
                      onClick={() => handleTagSelect(activeTag)}
                    >
                      Limpar seleção
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnModalClose}
                    onClick={handleCloseModal}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
