import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RowSlider from '../../components/RowSlider';
import { api } from '../../services/api';
import { getCached } from '../../services/apiCache';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

const HERO_CACHE_KEY = 'xboxwall_hero_slides_v2';
const HERO_CACHE_TTL_MS = 8 * 60 * 1000;

function readHeroCache() {
  try {
    const raw = sessionStorage.getItem(HERO_CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (!Array.isArray(data) || Date.now() - at > HERO_CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeHeroCache(data) {
  try {
    sessionStorage.setItem(HERO_CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
  }
}

function heroSlideImageUrl(banner) {
  if (!banner?.imageUrl) return '';
  if (banner.imageUrl.startsWith('http')) return banner.imageUrl;
  return `${API_URL}${banner.imageUrl}`;
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getInitialWallpapers(sort) {
  const params = { q: '', tag: '', sort, page: 1, limit: 10 };
  const cached = getCached('/api/wallpapers', params);
  return cached?.data || [];
}

export default function Home() {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(0);
  const [heroSlides, setHeroSlides] = useState(() => readHeroCache() || []);
  const [loadingHero, setLoadingHero] = useState(() => !readHeroCache()?.length);

  const [recentWallpapers, setRecentWallpapers] = useState(() => getInitialWallpapers(''));
  const [popularWallpapers, setPopularWallpapers] = useState(() => getInitialWallpapers('popular'));
  const [loadingWallpapers, setLoadingWallpapers] = useState(
    () => getInitialWallpapers('').length === 0
  );

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHero = async () => {
      const cached = readHeroCache();
      if (cached?.length && isMounted) {
        setHeroSlides(cached);
        setLoadingHero(false);
      }
      try {
        const data = await api.heroSlides.list();
        if (data.length > 0 && isMounted) {
          setHeroSlides(data);
          writeHeroCache(data);
        }
      } catch (error) {
        if (isMounted) console.error('Erro ao buscar hero slides:', error);
      } finally {
        if (isMounted) setLoadingHero(false);
      }
    };
    fetchHero();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchWallpapers = async () => {
      try {
        const [recentRes, popularRes] = await Promise.all([
          api.wallpapers.list({ limit: 10 }),
          api.wallpapers.list({ limit: 10, sort: 'popular' }),
        ]);

        if (isMounted) {
          if (recentRes.data) setRecentWallpapers(recentRes.data);
          if (popularRes.data) setPopularWallpapers(popularRes.data);
        }
      } catch (error) {
        if (isMounted) console.error('Erro ao buscar wallpapers:', error);
      } finally {
        if (isMounted) setLoadingWallpapers(false);
      }
    };
    fetchWallpapers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentBanner = heroSlides[activeBanner] || {};

  return (
    <div className={styles.home}>
      <div className={styles.backgroundGlow}>
        {currentBanner?.imageUrl && (
          <img
            key={`glow-${currentBanner.id}`}
            src={heroSlideImageUrl(currentBanner)}
            alt=""
            className={`${styles.glowImage} ${styles.active}`}
            aria-hidden="true"
          />
        )}
      </div>

      <section className={styles.hero}>
        <div className={styles.heroCard}>
          {loadingHero ? (
            <div className={styles.heroLoading} />
          ) : heroSlides.length > 0 ? (
            <>
              {heroSlides.map((banner, index) => {
                const imageUrl = heroSlideImageUrl(banner);
                return (
                  <div
                    key={banner.id}
                    className={`${styles.heroBackground} ${index === activeBanner ? styles.active : ''}`}
                  >
                    <img src={imageUrl} alt={banner.title} className={styles.heroImage} />
                    <div className={styles.heroGradient} />
                  </div>
                );
              })}

              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  {currentBanner.title?.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h1>
                <p className={styles.heroSubtitle}>
                  {currentBanner.subtitle?.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => navigate(`/collection/${currentBanner.targetTag}`)}
                >
                  {currentBanner.buttonText || 'Ver Coleção'}
                </button>
              </div>

              <div className={styles.carouselDots}>
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.dot} ${index === activeBanner ? styles.dotActive : ''}`}
                    onClick={() => setActiveBanner(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.heroEmptyState}>
              <div className={styles.heroEmptyGradient} />
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitleEmpty}>Descubra o Universo Xbox</h1>
                <p className={styles.heroSubtitleEmpty}>
                  Em breve, novos destaques e coleções épicas estarão disponíveis aqui.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.content}>
        <RowSlider
          title="Populares"
          items={popularWallpapers}
          loading={loadingWallpapers}
          onVerTudo={() => navigate('/gallery')}
          onView={handleViewDetails}
        />
        <RowSlider
          title="Mais Recentes"
          items={recentWallpapers}
          loading={loadingWallpapers}
          onVerTudo={() => navigate('/gallery')}
          onView={handleViewDetails}
        />
      </section>
    </div>
  );
}
