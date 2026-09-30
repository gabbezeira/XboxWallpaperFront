import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import Loader from '../../components/Loader';
import { ArrowLeft, User, Layers } from 'lucide-react';
import styles from './styles.module.scss';

export default function Collection() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        } catch {}

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

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
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
        <button type="button" className={styles.btnBack} onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={24} />
        </button>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{collection?.name || tag}</h1>
          <div className={styles.metaRow}>
            <span className={styles.subtitle}>Coleção Oficial</span>
            {collection?.creatorName && (
              <span className={styles.creatorPill}>
                <User size={12} />
                <span>{collection.creatorName}</span>
              </span>
            )}
          </div>
          {collection?.description && (
            <p className={styles.description}>{collection.description}</p>
          )}
        </div>
      </div>

      {loading ? (
        <Loader text={`Carregando coleção ${collection?.name || tag}...`} />
      ) : wallpapers.length > 0 ? (
        <WallpaperGrid wallpapers={wallpapers} onView={handleViewDetails} />
      ) : (
        <div className={styles.empty}>
          <Layers size={36} className={styles.emptyIcon} />
          <p>Nenhum wallpaper encontrado nesta coleção.</p>
        </div>
      )}
    </div>
  );
}
