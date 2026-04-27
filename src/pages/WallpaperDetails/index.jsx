import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Heart, Monitor, HardDrive, Download } from 'lucide-react'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'
import { api, API_URL } from '../../services/api'
import { formatFileSize } from '../../utils/format.js'
import Loader from '../../components/Loader'
import styles from './styles.module.scss'

function formatResolution(width, height) {
  if (!width || !height) return '—'
  if (width >= 3840) return '4K'
  if (width >= 2560) return '2K'
  if (width >= 1920) return 'Full HD'
  return `${width}×${height}`
}

const COMMUNITY_LABEL = 'Xbox Community'

function getAuthorDisplay(wallpaper, authUser, profile) {
  const isCommunity = wallpaper.userId === 'system'
  if (isCommunity) {
    return { label: COMMUNITY_LABEL, photo: null }
  }

  const isOwn = Boolean(authUser?.uid) && wallpaper.userId === authUser.uid

  if (isOwn) {
    return {
      label:
        wallpaper.authorName ||
        profile?.displayName ||
        authUser?.displayName ||
        authUser?.email?.split('@')[0] ||
        'Usuário',
      photo:
        wallpaper.authorPhoto ||
        profile?.photoURL ||
        authUser?.photoURL ||
        null
    }
  }

  return {
    label: wallpaper.authorName || COMMUNITY_LABEL,
    photo: wallpaper.authorPhoto || null
  }
}

export default function WallpaperDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user: authUser, profile } = useAuth()

  const [wallpaper, setWallpaper] = useState(() => {
    const s = location.state?.wallpaper
    return s?.id === id ? s : null
  })
  const [hydrating, setHydrating] = useState(() => {
    const s = location.state?.wallpaper
    return !(s?.id === id)
  })
  const [mediaToken, setMediaToken] = useState(null)

  useEffect(() => {
    const seed = location.state?.wallpaper?.id === id ? location.state.wallpaper : null
    if (seed) {
      setWallpaper(seed)
      setHydrating(false)
    } else {
      setHydrating(true)
      setWallpaper(null)
    }

    if (!id) return undefined

    let cancelled = false
    ;(async () => {
      try {
        const fresh = await api.wallpapers.getById(id)
        if (cancelled) return
        setWallpaper((prev) => ({ ...(seed || prev || {}), ...fresh }))
      } catch {
        if (!cancelled && !seed) setWallpaper(null)
      } finally {
        if (!cancelled) setHydrating(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id, location.key, location.state])

  useEffect(() => {
    if (!authUser || !wallpaper?.id) {
      setMediaToken(null)
      return
    }
    let cancelled = false
    authUser.getIdToken().then((t) => {
      if (!cancelled) setMediaToken(t)
    })
    return () => {
      cancelled = true
    }
  }, [authUser, wallpaper?.id])

  /** Hero na página de detalhes: `preview=true` (backend gera WebP ~1600px / q84). Download e fullscreen continuam com o ficheiro completo. */
  const imageSrc = useMemo(() => {
    if (!wallpaper?.storageUrl) return ''
    const url = wallpaper.storageUrl
    if (url.startsWith('http')) return url
    const base = API_URL
    const path = `${base}${url}`
    const needsToken =
      wallpaper.isPublic === false &&
      authUser?.uid &&
      wallpaper.userId === authUser?.uid &&
      mediaToken
    const sep = url.includes('?') ? '&' : '?'
    const preview = `${path}${sep}preview=true`
    if (needsToken) {
      return `${preview}&token=${encodeURIComponent(mediaToken)}`
    }
    return preview
  }, [wallpaper, authUser?.uid, mediaToken])

  if (hydrating && !wallpaper) {
    return (
      <div className={styles.page}>
        <Loader text="Carregando wallpaper..." />
      </div>
    )
  }

  if (!wallpaper?.id) {
    return <Navigate to="/" replace />
  }

  const fav = isFavorite(wallpaper.id)
  const { label: authorLabel, photo: authorPhoto } = getAuthorDisplay(wallpaper, authUser, profile)

  const handleToggleFavorite = () => toggleFavorite(wallpaper)

  const handleSetWallpaper = () => {
    navigate(`/wallpaper/${wallpaper.id}/fullscreen`, { state: { wallpaper } })
  }

  const handleDownload = async () => {
    const downloadUrl = await api.wallpapers.downloadUrl(wallpaper.id)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = wallpaper.fileName || 'wallpaper.jpg'
    a.click()
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.imageSection}>
          <button type="button" className={styles.btnBack} onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            className={styles.imageBtn}
            onClick={handleSetWallpaper}
            aria-label="Ver em tela cheia"
          >
            <img src={imageSrc} alt={wallpaper.title || 'Wallpaper'} className={styles.image} />
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
                {authorPhoto ? (
                  <img src={authorPhoto} alt={authorLabel} className={styles.avatarImg} />
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              Por {authorLabel}
            </div>
            <div className={styles.stats}>
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
              <button type="button" className={styles.btnExtra} onClick={handleDownload}>
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
