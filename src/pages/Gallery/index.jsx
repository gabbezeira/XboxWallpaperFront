import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import {
  Search,
  X,
  SlidersHorizontal,
  Flame,
  Clock,
  Tag,
  ImageOff,
} from 'lucide-react';
import styles from './styles.module.scss';

const TAXONOMY_GROUPS = [
  { id: 'all', label: 'Todos' },
  { id: 'games', label: '🎮 Jogos' },
  { id: 'styles', label: '🎨 Estilos de Arte' },
  { id: 'themes', label: '🌌 Temas & Paisagens' },
  { id: 'popular', label: '🔥 Em Alta' },
];

const KNOWN_GAME_KEYWORDS = [
  'halo',
  'forza',
  'gears',
  'minecraft',
  'starfield',
  'sea of thieves',
  'cyberpunk',
  'elden ring',
  'grounded',
  'redfall',
  'hi-fi rush',
  'hellblade',
  'doom',
  'fallout',
  'skyrim',
  'witcher',
  'gta',
  'assassin',
  'cod',
  'battlefield',
  'fifa',
  'apex',
];

const KNOWN_STYLE_KEYWORDS = [
  'minimal',
  'dark',
  'oled',
  'abstract',
  'neon',
  'retro',
  'cyberpunk',
  'anime',
  '3d',
  'vector',
  'pixel',
  'vaporwave',
  'glitch',
  'synthwave',
  'art',
  '4k',
];

const KNOWN_THEME_KEYWORDS = [
  'nature',
  'space',
  'landscape',
  'galaxy',
  'sci-fi',
  'fantasy',
  'cars',
  'city',
  'mountains',
  'ocean',
  'sunset',
  'night',
  'forest',
  'sky',
];

export default function Gallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const activeTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const [activeGroup, setActiveGroup] = useState('all');
  const [availableTags, setAvailableTags] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [localSearch, setLocalSearch] = useState(q);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.wallpapers
      .tags()
      .then((res) => {
        if (!isMounted || !res) return;
        setAvailableTags(res.tags || []);
        setAvailableGames(res.games || []);
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
    if (!availableTags.length) return [];

    if (activeGroup === 'games') {
      const gameMatches = availableTags.filter((t) => {
        const lower = t.name.toLowerCase();
        return (
          KNOWN_GAME_KEYWORDS.some((k) => lower.includes(k)) ||
          availableGames.some((g) => g.name.toLowerCase().includes(lower))
        );
      });
      return gameMatches.slice(0, 14);
    }

    if (activeGroup === 'styles') {
      const styleMatches = availableTags.filter((t) => {
        const lower = t.name.toLowerCase();
        return KNOWN_STYLE_KEYWORDS.some((k) => lower.includes(k));
      });
      return styleMatches.slice(0, 14);
    }

    if (activeGroup === 'themes') {
      const themeMatches = availableTags.filter((t) => {
        const lower = t.name.toLowerCase();
        return KNOWN_THEME_KEYWORDS.some((k) => lower.includes(k));
      });
      return themeMatches.slice(0, 14);
    }

    if (activeGroup === 'popular') {
      return [...availableTags].sort((a, b) => b.count - a.count).slice(0, 14);
    }

    return availableTags.slice(0, 12);
  }, [activeGroup, availableTags, availableGames]);

  const modalFilteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return availableTags;
    const queryLower = tagSearchQuery.trim().toLowerCase();
    return availableTags.filter((t) => t.name.toLowerCase().includes(queryLower));
  }, [availableTags, tagSearchQuery]);

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
  };

  const handleTagSelect = (tagToSet) => {
    const newParams = new URLSearchParams(searchParams);
    if (activeTag === tagToSet) {
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

  const handleClearFilter = (filterKey) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterKey);
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
          <div className={styles.taxonomyBar}>
            <div className={styles.taxonomyTabs} role="tablist">
              {TAXONOMY_GROUPS.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  role="tab"
                  aria-selected={activeGroup === grp.id}
                  className={`${styles.taxonomyBtn} ${activeGroup === grp.id ? styles.active : ''}`}
                  onClick={() => setActiveGroup(grp.id)}
                >
                  {grp.label}
                </button>
              ))}
            </div>

            <div className={styles.sortControls}>
              <button
                type="button"
                className={`${styles.sortBtn} ${currentSort !== 'popular' ? styles.active : ''}`}
                onClick={() => handleSortToggle('recent')}
                title="Mais Recentes"
              >
                <Clock size={13} />
                <span>Recentes</span>
              </button>
              <button
                type="button"
                className={`${styles.sortBtn} ${currentSort === 'popular' ? styles.active : ''}`}
                onClick={() => handleSortToggle('popular')}
                title="Mais Populares"
              >
                <Flame size={13} />
                <span>Populares</span>
              </button>
            </div>
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

            {availableTags.length > 8 && (
              <button
                type="button"
                className={styles.btnAllTags}
                onClick={() => setTagModalOpen(true)}
              >
                <SlidersHorizontal size={13} />
                <span>Ver todas as tags ({availableTags.length})</span>
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className={styles.activeFiltersBar}>
              <div className={styles.activeChipsList}>
                {q && (
                  <span className={styles.filterBadge}>
                    <span>Busca: &quot;{q}&quot;</span>
                    <button
                      type="button"
                      className={styles.filterBadgeRemove}
                      onClick={() => handleClearFilter('q')}
                      aria-label="Remover busca"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {activeTag && (
                  <span className={styles.filterBadge}>
                    <span>Tag: {activeTag}</span>
                    <button
                      type="button"
                      className={styles.filterBadgeRemove}
                      onClick={() => handleClearFilter('tag')}
                      aria-label="Remover tag"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {currentSort === 'popular' && (
                  <span className={styles.filterBadge}>
                    <span>Ordem: Populares</span>
                    <button
                      type="button"
                      className={styles.filterBadgeRemove}
                      onClick={() => handleClearFilter('sort')}
                      aria-label="Remover ordenação popular"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
              </div>

              <div className={styles.filterMeta}>
                <span className={styles.resultsCount}>
                  {totalItems} wallpaper{totalItems === 1 ? '' : 's'} encontrado{totalItems === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  className={styles.btnClearFilters}
                  onClick={handleClearAll}
                >
                  Limpar tudo
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <Loader text="Buscando wallpapers..." />
        ) : wallpapers.length > 0 ? (
          <>
            <WallpaperGrid wallpapers={wallpapers} onView={handleViewDetails} />
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

      {tagModalOpen && (
        <div
          className={styles.tagModalOverlay}
          onClick={() => setTagModalOpen(false)}
        >
          <div
            className={styles.tagModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.tagModalHeader}>
              <div className={styles.titleArea}>
                <h3 className={styles.tagModalTitle}>Todas as Tags & Categorias</h3>
                <span className={styles.subtitle}>
                  Selecione uma tag para filtrar os wallpapers
                </span>
              </div>
              <button
                type="button"
                className={styles.tagModalClose}
                onClick={() => setTagModalOpen(false)}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.tagModalSearchWrapper}>
              <div className={styles.tagModalSearchInput}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Pesquisar entre todas as tags..."
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  autoFocus
                />
                {tagSearchQuery && (
                  <button
                    type="button"
                    className={styles.tagModalClose}
                    onClick={() => setTagSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.tagModalBody}>
              {modalFilteredTags.length === 0 ? (
                <div className={styles.empty}>
                  <p>Nenhuma tag encontrada para &quot;{tagSearchQuery}&quot;</p>
                </div>
              ) : (
                modalFilteredTags.map((t) => {
                  const isSelected = activeTag.toLowerCase() === t.name.toLowerCase();
                  return (
                    <button
                      key={t.name}
                      type="button"
                      className={`${styles.tagChip} ${isSelected ? styles.active : ''}`}
                      onClick={() => handleTagSelect(t.name)}
                    >
                      <Tag size={12} />
                      <span>{t.name}</span>
                      <span className={styles.tagCount}>{t.count}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
