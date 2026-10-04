import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import CollectionCard from '../../components/CollectionCard';
import { Search, ArrowRight, Compass } from 'lucide-react';
import Pagination from '../../components/Pagination';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
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
        <PageHeader
          kicker="Curadoria & Comunidade"
          title="Coleções"
          subtitle="Explore coleções temáticas ou busque pelo código de acesso"
        />

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

                return (
                  <CollectionCard
                    key={col.id}
                    collection={col}
                    onClick={() => navigate(`/collection/${col.slug || col.id}`)}
                    onCopyCode={handleCopyCode}
                    isCopied={isCopied}
                  />
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
          <EmptyState
            icon={Compass}
            title="Nenhuma coleção encontrada"
            message="Não localizamos nenhuma coleção com os termos digitados. Tente buscar por outro nome ou código."
          />
        )}
      </div>
    </div>
  );
}
