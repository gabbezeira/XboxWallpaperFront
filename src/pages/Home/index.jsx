import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RowSlider from '../../components/RowSlider'
import { api } from '../../services/api'
import styles from './styles.module.scss'

import { API_URL } from '../../services/api'

const HERO_CACHE_KEY = 'xboxwall_hero_slides_v2'
const HERO_CACHE_TTL_MS = 8 * 60 * 1000

function readHeroCache() {
  try {
    const raw = sessionStorage.getItem(HERO_CACHE_KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw)
    if (!Array.isArray(data) || Date.now() - at > HERO_CACHE_TTL_MS) return null
    return data
  } catch {
    /* sessionStorage indisponível ou JSON inválido */
    return null
  }
}

function writeHeroCache(data) {
  try {
    sessionStorage.setItem(HERO_CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* quota / modo privado */
  }
}

function heroSlideImageUrl(banner) {
  if (!banner?.imageUrl) return ''
  if (banner.imageUrl.startsWith('http')) return banner.imageUrl
  return `${API_URL}${banner.imageUrl}`
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Home() {
  const navigate = useNavigate()
  const [activeBanner, setActiveBanner] = useState(0)
  const [heroSlides, setHeroSlides] = useState(() => readHeroCache() || [])
  const [loadingHero, setLoadingHero] = useState(() => !readHeroCache()?.length)
  const [recentWallpapers, setRecentWallpapers] = useState([])
  const [popularWallpapers, setPopularWallpapers] = useState([])
  const [loadingWallpapers, setLoadingWallpapers] = useState(true)

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } })
  }

  useEffect(() => {
    const fetchHero = async () => {
      const cached = readHeroCache()
      if (cached?.length) {
        setHeroSlides(cached)
        setLoadingHero(false)
      }
      try {
        const data = await api.heroSlides.list()
        if (data.length > 0) {
          const shuffled = shuffleArray(data)
          setHeroSlides(shuffled)
          writeHeroCache(shuffled)
        }
      } catch (error) {
        console.error('Erro ao buscar hero slides:', error)
      } finally {
        setLoadingHero(false)
      }
    }
    fetchHero()
  }, [])

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const [recentRes, popularRes] = await Promise.all([
          api.wallpapers.list({ limit: 10 }),
          api.wallpapers.list({ limit: 10, sort: 'popular' })
        ])
        
        if (recentRes.data) {
          setRecentWallpapers(recentRes.data)
        }
        if (popularRes.data) {
          setPopularWallpapers(popularRes.data)
        }
      } catch (error) {
        console.error('Erro ao buscar wallpapers:', error)
      } finally {
        setLoadingWallpapers(false)
      }
    }
    fetchWallpapers()
  }, [])

  useEffect(() => {
    if (heroSlides.length <= 1) return
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const currentBanner = heroSlides[activeBanner] || {}

  return (
    <div className={styles.home}>
      <div className={styles.backgroundGlow}>
        {heroSlides.map((banner, index) => {
          const imageUrl = heroSlideImageUrl(banner)
          return (
            <img
              key={`glow-${banner.id}`}
              src={imageUrl}
              alt=""
              className={`${styles.glowImage} ${index === activeBanner ? styles.active : ''}`}
              aria-hidden="true"
            />
          )
        })}
      </div>

      <section className={styles.hero}>
        <div className={styles.heroCard}>
          {loadingHero ? (
            <div className={styles.heroLoading} />
          ) : heroSlides.length > 0 ? (
            <>
              {heroSlides.map((banner, index) => {
                const imageUrl = heroSlideImageUrl(banner)
                return (
                  <div
                    key={banner.id}
                    className={`${styles.heroBackground} ${index === activeBanner ? styles.active : ''}`}
                  >
                    <img src={imageUrl} alt={banner.title} className={styles.heroImage} />
                    <div className={styles.heroGradient} />
                  </div>
                )
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
                  Ver Coleção
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
  )
}
