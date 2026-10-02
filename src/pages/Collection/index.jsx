import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { ArrowLeft, User, Layers, Share2, Check } from 'lucide-react';
import styles from './styles.module.scss';

const ITEMS_PER_PAGE = 24;

export default function Collection() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        try {
          const colRes = await api.collections.getBySlug(tag);
          if (isMounted && colRes?.collection) {
            setCollection(colRes.collection);
            setWallpapers(colRes.wallpapers || []);
            return;
          }
        } catch (err) {
          void err;
        }

        const response = await api.wallpapers.list({ tag, page: 1, limit: 100 });
        if (isMounted) {
          setCollection(null);
          setWallpapers(response.data || []);
        }
      } catch (error) {
        if (isMounted) console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (tag) {
      fetchCollectionData();
    }

    return () => {
      isMounted = false;
    };
  }, [tag]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
  };

  const totalPages = useMemo(() => Math.ceil(wallpapers.length / ITEMS_PER_PAGE), [wallpapers.length]);
  const paginatedWallpapers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return wallpapers.slice(start, start + ITEMS_PER_PAGE);
  }, [wallpapers, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      {collection?.bannerUrl && (
        <div className={styles.bannerContainer}>
          <img src={collection.bannerUrl} alt={collection.name} className={styles.bannerImg} />
          <div className={styles.bannerGradient} />
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button
            type="button"
            className={styles.btnBack}
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            tabIndex={0}
          >
            <ArrowLeft size={20} />
          </button>

          <div className={styles.titleArea}>
            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>Coleção Oficial</span>
              {collection?.creatorName && (
                <span className={styles.creatorPill}>
                  <User size={13} />
                  <span>{collection.creatorName}</span>
                </span>
              )}
              {wallpapers.length > 0 && (
                <span className={styles.countPill}>
                  {wallpapers.length} {wallpapers.length === 1 ? 'wallpaper' : 'wallpapers'}
                </span>
              )}
            </div>

            <h1 className={styles.title}>{collection?.name || tag}</h1>

            {collection?.description && (
              <p className={styles.description}>{collection.description}</p>
            )}
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnShare}
              onClick={handleShare}
              tabIndex={0}
              title="Compartilhar link desta coleção"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text={`Carregando coleção ${collection?.name || tag}...`} />
      ) : wallpapers.length > 0 ? (
        <div className={styles.gridSection}>
          <WallpaperGrid wallpapers={paginatedWallpapers} onView={handleViewDetails} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIconBox}>
            <Layers size={32} />
          </div>
          <h2 className={styles.emptyTitle}>Nenhum wallpaper encontrado</h2>
          <p className={styles.emptyText}>
            Esta coleção ainda não possui imagens públicas associadas.
          </p>
        </div>
      )}
    </div>
  );
}
