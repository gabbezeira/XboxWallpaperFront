import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { API_URL } from '../../services/api'
import styles from './styles.module.scss'



export default function FullscreenViewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const wallpaper = location.state?.wallpaper
  const [mediaToken, setMediaToken] = useState(null)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') navigate(-1)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [navigate])

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

  const imageSrc = useMemo(() => {
    if (!wallpaper?.storageUrl) return ''
    const url = wallpaper.storageUrl
    if (url.startsWith('http')) return url
    const base = API_URL
    const path = `${base}${url}`
    const needsToken =
      wallpaper.isPublic === false &&
      authUser?.uid &&
      wallpaper.userId === authUser.uid &&
      mediaToken
    if (needsToken) {
      const sep = url.includes('?') ? '&' : '?'
      return `${path}${sep}token=${encodeURIComponent(mediaToken)}`
    }
    return path
  }, [wallpaper, authUser?.uid, mediaToken])

  if (!wallpaper) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.btnBack} onClick={() => navigate(-1)} aria-label="Voltar">
        <ArrowLeft size={24} />
      </button>

      <img
        className={styles.image}
        src={imageSrc}
        alt={wallpaper.title || 'Wallpaper em tela cheia'}
      />

      <div className={styles.guide}>
        <span>No Xbox, aperte</span>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </div>
        <span>e selecione &quot;Definir como fundo de tela&quot;</span>
      </div>
    </div>
  )
}
