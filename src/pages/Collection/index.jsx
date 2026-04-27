import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import WallpaperGrid from '../../components/WallpaperGrid'
import Loader from '../../components/Loader'
import { ArrowLeft } from 'lucide-react'
import styles from './styles.module.scss'

export default function Collection() {
  const { tag } = useParams()
  const navigate = useNavigate()
  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchCollection = async () => {
      try {
        setLoading(true)
        const response = await api.wallpapers.list({ tag, page: 1, limit: 100 })
        if (isMounted) setWallpapers(response.data || [])
      } catch (error) {
        if (isMounted) console.error('Erro ao carregar coleção:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (tag) {
      fetchCollection()
    }

    return () => { isMounted = false }
  }, [tag])

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={24} />
        </button>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{tag}</h1>
          <span className={styles.subtitle}>Coleção Oficial</span>
        </div>
      </div>

      {loading ? (
        <Loader text={`Carregando coleção ${tag}...`} />
      ) : wallpapers.length > 0 ? (
        <WallpaperGrid wallpapers={wallpapers} onView={handleViewDetails} />
      ) : (
        <div className={styles.empty}>
          Nenhum wallpaper encontrado nesta coleção.
        </div>
      )}
    </div>
  )
}
