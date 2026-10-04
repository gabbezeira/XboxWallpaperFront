import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Layers,
  Search,
  ArrowRight,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import UserAvatar from '../../components/UserAvatar';
import Pagination from '../../components/Pagination';
import styles from './styles.module.scss';

const ITEMS_PER_PAGE = 12;

export default function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const data = await api.collections.list();
        if (isMounted) {
          setCollections(data || []);
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCollections();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchQuery.trim();
    if (!clean) return;
    const match = collections.find(
      (c) =>
        c.code?.toLowerCase() === clean.toLowerCase() ||
        c.slug?.toLowerCase() === clean.toLowerCase()
    );
    if (match) {
      navigate(`/collection/${match.slug || match.id}`);
    }
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase().trim();
    return collections.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const slugMatch = c.slug?.toLowerCase().includes(q);
      const codeMatch = c.code?.toLowerCase().includes(q);
      const linkedName = c.linkedUserName || 'Spartan Wallpapers';
      const creatorMatch = linkedName?.toLowerCase().includes(q);
      const descMatch = c.description?.toLowerCase().includes(q);
      return nameMatch || slugMatch || codeMatch || creatorMatch || descMatch;
    });
  }, [collections, searchQuery]);

  const totalPages = useMemo(
    () => Math.ceil(filteredCollections.length / ITEMS_PER_PAGE),
    [filteredCollections.length]
  );

  const paginatedCollections = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCollections.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCollections, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Coleções</h1>
            <p className={styles.subtitle}>
              Explore coleções temáticas ou busque pelo código de acesso
            </p>
          </div>
        </div>

        <div className={styles.toolbarSection}>
          <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome, criador ou código..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.searchInput}
            />
            {searchQuery.trim() && (
              <button type="submit" className={styles.btnGoCode} tabIndex={0}>
                <ArrowRight size={16} />
              </button>
            )}
          </form>
          <span className={styles.resultsCount}>
            {filteredCollections.length}{' '}
            {filteredCollections.length === 1 ? 'coleção' : 'coleções'}
          </span>
        </div>

        {loading ? (
          <Loader text="Carregando coleções..." />
        ) : filteredCollections.length > 0 ? (
          <>
            <div className={styles.collectionsGrid}>
              {paginatedCollections.map((col) => {
              const displayCode = col.code || col.slug?.toUpperCase() || `COL-${col.id.slice(0, 5).toUpperCase()}`;
              const isCopied = copiedCode === displayCode;
              const hasLinkedUser = Boolean(col.linkedUserName);
              const linkedUserName = col.linkedUserName || 'Spartan Wallpapers';
              const linkedUserVerified = hasLinkedUser ? col.linkedUserVerified : true;

              return (
                <div
                  key={col.id}
                  className={styles.collectionCard}
                  onClick={() => navigate(`/collection/${col.slug || col.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/collection/${col.slug || col.id}`);
                    }
                  }}
                >
                  <div className={styles.cardBannerArea}>
                    {col.bannerUrl ? (
                      <img src={col.bannerUrl} alt="" className={styles.cardBannerImg} loading="lazy" />
                    ) : (
                      <div className={styles.cardBannerFallback}>
                        <Layers size={36} />
                      </div>
                    )}
                    <div className={styles.cardBannerGradient} />
                    <button
                      type="button"
                      className={styles.btnCopyCardCode}
                      onClick={(e) => handleCopyCode(e, displayCode)}
                      onKeyDown={(e) => e.stopPropagation()}
                      title="Copiar código da coleção"
                      aria-label={`Copiar código ${displayCode}`}
                      tabIndex={0}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copiado!' : displayCode}</span>
                    </button>
                    <div className={styles.cardOverlay}>
                      <h3 className={styles.cardTitle}>{col.name}</h3>
                      {col.description && <p className={styles.cardDesc}>{col.description}</p>}
                      <div className={styles.cardFooter}>
                        <span className={styles.creatorPill} title={`Criador: ${linkedUserName}`}>
                          <UserAvatar
                            photoUrl={hasLinkedUser ? col.linkedUserPhoto : null}
                            name={linkedUserName}
                            size="small"
                          />
                          <span className={styles.creatorName}>{linkedUserName}</span>
                          {linkedUserVerified && <VerifiedBadge size={13} />}
                        </span>
                        <span className={styles.viewLink}>
                          Ver coleção <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconBox}>
              <Compass size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Nenhuma coleção encontrada</h3>
            <p className={styles.emptyDesc}>
              Não localizamos nenhuma coleção com os termos digitados. Tente buscar por outro nome ou código.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
