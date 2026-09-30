import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Heart, Monitor, HardDrive, Download, Layers } from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import { useLocation, useNavigate, Navigate, useParams, Link } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { formatFileSize } from '../../utils/format.js';
import Loader from '../../components/Loader';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

function formatResolution(width, height) {
  if (!width || !height) return '—';
  if (width >= 3840) return '4K';
  if (width >= 2560) return '2K';
  if (width >= 1920) return 'Full HD';
  return `${width}×${height}`;
}

function getUserLevel(favoritesCount = 0) {
  if (favoritesCount >= 250) return { key: 'spartan', label: 'SPARTAN ULTIMATE' };
  if (favoritesCount >= 100) return { key: 'elite', label: 'ELITE' };
  if (favoritesCount >= 50) return { key: 'veterano', label: 'VETERANO' };
  if (favoritesCount >= 20) return { key: 'criador', label: 'CRIADOR' };
  if (favoritesCount >= 5) return { key: 'explorador', label: 'EXPLORADOR' };
  return { key: 'recruta', label: 'RECRUTA' };
}

function getAuthorDisplay(wallpaper, authUser, profile) {
  const isSystem = wallpaper.userId === 'system' || !wallpaper.userId;
  if (isSystem) {
    return {
      label: 'Spartan Wallpapers',
      photo: null,
      isVerified: true,
      tier: { key: 'spartan', label: 'SPARTAN' },
    };
  }

  const isOwn = Boolean(authUser?.uid) && wallpaper.userId === authUser.uid;
  if (isOwn) {
    return {
      label:
        wallpaper.authorName ||
        profile?.displayName ||
        authUser?.displayName ||
        authUser?.email?.split('@')[0] ||
        'Usuário',
      photo: wallpaper.authorPhoto || profile?.photoURL || authUser?.photoURL || null,
      isVerified: Boolean(wallpaper.isVerified ?? profile?.isVerified),
      tier: getUserLevel(profile?.totalFavoritesReceived || 0),
    };
  }

  return {
    label: wallpaper.authorName || 'Comunidade Xbox',
    photo: wallpaper.authorPhoto || null,
    isVerified: Boolean(wallpaper.isVerified),
    tier: getUserLevel(wallpaper.authorFavoritesReceived || 0),
  };
}

export default function WallpaperDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user: authUser, profile } = useAuth();

  const [wallpaper, setWallpaper] = useState(() => {
    const s = location.state?.wallpaper;
    return s?.id === id ? s : null;
  });
  const [hydrating, setHydrating] = useState(() => {
    const s = location.state?.wallpaper;
    return !(s?.id === id);
  });
  const [mediaToken, setMediaToken] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  useEffect(() => {
    const seed = location.state?.wallpaper?.id === id ? location.state.wallpaper : null;
    if (seed) {
      setWallpaper(seed);
      setHydrating(false);
      setPhotoError(false);
    } else {
      setHydrating(true);
      setWallpaper(null);
      setPhotoError(false);
    }

    if (!id) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const fresh = await api.wallpapers.getById(id);
        if (cancelled) return;
        setWallpaper((prev) => ({ ...(seed || prev || {}), ...fresh }));
      } catch {
        if (!cancelled && !seed) setWallpaper(null);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, location.key, location.state]);

  useEffect(() => {
    if (!authUser || !wallpaper?.id) {
      setMediaToken(null);
      return;
    }
    let cancelled = false;
    authUser.getIdToken().then((t) => {
      if (!cancelled) setMediaToken(t);
    });
    return () => {
      cancelled = true;
    };
  }, [authUser, wallpaper?.id]);

  const imageSrc = useMemo(() => {
    let raw = wallpaper?.previewUrl || wallpaper?.storageUrl || wallpaper?.thumbUrl || '';
    if (!raw) return '';

    if (raw.includes('thumb=true')) {
      raw = raw.replace('thumb=true', 'preview=true');
    } else if (!raw.includes('preview=true') && (raw.includes('/api/wallpapers/') || raw.startsWith('/'))) {
      const sep = raw.includes('?') ? '&' : '?';
      raw = `${raw}${sep}preview=true`;
    }

    const isHttp = raw.startsWith('http');
    const base = API_URL;
    let url = isHttp ? raw : `${base}${raw}`;

    const needsToken =
      wallpaper.isPublic === false &&
      authUser?.uid &&
      wallpaper.userId === authUser?.uid &&
      mediaToken &&
      !url.includes('token=');

    if (needsToken) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}token=${encodeURIComponent(mediaToken)}`;
    }

    return url;
  }, [wallpaper, authUser?.uid, mediaToken]);

  const thumbSrc = useMemo(() => {
    let raw = wallpaper?.thumbUrl || '';
    if (!raw) return '';
    const isHttp = raw.startsWith('http');
    const base = API_URL;
    let url = isHttp ? raw : `${base}${raw}`;

    const needsToken =
      wallpaper.isPublic === false &&
      authUser?.uid &&
      wallpaper.userId === authUser?.uid &&
      mediaToken &&
      !url.includes('token=');

    if (needsToken) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}token=${encodeURIComponent(mediaToken)}`;
    }

    return url;
  }, [wallpaper, authUser?.uid, mediaToken]);

  useEffect(() => {
    setPreviewLoaded(false);
  }, [imageSrc]);

  if (hydrating && !wallpaper) {
    return (
      <div className={styles.page}>
        <Loader text="Carregando wallpaper..." />
      </div>
    );
  }

  if (!wallpaper?.id) {
    return <Navigate to="/" replace />;
  }

  const fav = isFavorite(wallpaper.id);
  const authorInfo = getAuthorDisplay(wallpaper, authUser, profile);

  const handleToggleFavorite = () => toggleFavorite(wallpaper);

  const handleSetWallpaper = () => {
    navigate(`/wallpaper/${wallpaper.id}/fullscreen`, { state: { wallpaper } });
  };

  const handleDownload = async () => {
    const downloadUrl = await api.wallpapers.downloadUrl(wallpaper.id);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = wallpaper.fileName || 'wallpaper.jpg';
    a.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.imageSection}>
          <button
            type="button"
            className={styles.btnBack}
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            className={styles.imageBtn}
            onClick={handleSetWallpaper}
            aria-label="Ver em tela cheia"
            tabIndex="-1"
          >
            <div className={styles.imageWrapper}>
              {thumbSrc && (
                <img
                  src={thumbSrc}
                  alt=""
                  className={`${styles.thumbPlaceholder} ${previewLoaded ? styles.thumbHidden : ''}`}
                  aria-hidden="true"
                />
              )}
              <img
                src={imageSrc}
                alt={wallpaper.title || 'Wallpaper'}
                className={`${styles.image} ${previewLoaded ? styles.loaded : ''}`}
                onLoad={() => setPreviewLoaded(true)}
              />
            </div>
          </button>
          <div className={styles.gradient} />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>{wallpaper.title || 'Sem título'}</h2>
              {wallpaper.subtitle && <h3 className={styles.subtitle}>{wallpaper.subtitle}</h3>}
            </div>
            <button
              type="button"
              className={`${styles.btnFavIcon} ${fav ? styles.isFav : ''}`}
              onClick={handleToggleFavorite}
            >
              <Heart size={24} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className={styles.meta}>
            <div className={styles.author}>
              <div className={styles.avatar}>
                {authorInfo.photo && !photoError ? (
                  <img
                    src={authorInfo.photo}
                    alt={authorInfo.label}
                    className={styles.avatarImg}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <div className={styles.authorDetails}>
                <div className={styles.authorNameRow}>
                  <span>Por {authorInfo.label}</span>
                  {authorInfo.isVerified && (
                    <VerifiedBadge size={16} className={styles.verifiedIcon} title="Criador Verificado" />
                  )}
                </div>
                {authorInfo.tier && (
                  <span className={`${styles.tierBadge} ${styles[authorInfo.tier.key]}`}>
                    {authorInfo.tier.label}
                  </span>
                )}
              </div>
            </div>

            {wallpaper.collectionSlug && (
              <Link to={`/c/${wallpaper.collectionSlug}`} className={styles.collectionLink}>
                <Layers size={14} />
                <span>Coleção: {wallpaper.collectionSlug}</span>
              </Link>
            )}

            <div className={styles.stats}>
              <div className={styles.statFav} title="Total de favoritos">
                <Heart size={14} className={styles.statFavIcon} />
                <span>{wallpaper.favoriteCount || 0}</span>
              </div>
              <div className={styles.stat}>
                <Monitor size={14} />
                {formatResolution(wallpaper.width, wallpaper.height)}
              </div>
              <div className={styles.stat}>
                <HardDrive size={14} />
                {formatFileSize(wallpaper.sizeBytes)}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnSetWallpaper} onClick={handleSetWallpaper}>
              DEFINIR COMO WALLPAPER
            </button>
            <div className={styles.secondaryActions}>
              <button type="button" className={styles.btnAddFav} onClick={handleToggleFavorite}>
                {fav ? 'REMOVER DOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}
              </button>
              <button type="button" className={styles.btnExtra} onClick={handleDownload} aria-label="Baixar wallpaper">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
