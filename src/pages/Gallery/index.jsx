import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import WallpaperGrid from '../../components/WallpaperGrid'
import Pagination from '../../components/Pagination'
import Loader from '../../components/Loader'
import { Search } from 'lucide-react'
import styles from './styles.module.scss'

const CATEGORIES = ['Tudo', 'Halo', 'Forza', 'Gears', 'Minecraft', 'Starfield', 'Abstract', 'Nature', 'Dark', 'Minimal']

export default function Gallery() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || ''
  const page = parseInt(searchParams.get('page')) || 1

  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  // Para mobile search local
  const [localSearch, setLocalSearch] = useState(q)

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true)
        const res = await api.wallpapers.list({ q, tag: tag !== 'Tudo' ? tag : '', page, limit: 12 })
        setWallpapers(res.data)
        setTotalPages(res.totalPages)
        setTotalItems(res.totalItems)
      } catch (error) {
        console.error('Erro ao buscar galeria:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWallpapers()
  }, [q, tag, page])

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } })
  }

  const handleCategoryClick = (category) => {
    const newParams = new URLSearchParams()
    if (q) newParams.set('q', q)
    if (category !== 'Tudo') newParams.set('tag', category)
    newParams.set('page', '1') // reseta paginação
    setSearchParams(newParams)
  }

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMobileSearch = (e) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (localSearch.trim()) {
      newParams.set('q', localSearch.trim())
      newParams.set('page', '1')
    } else {
      newParams.delete('q')
      newParams.set('page', '1')
    }
    setSearchParams(newParams)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Explorar</h1>
            <p className={styles.subtitle}>Encontre os melhores wallpapers para seu Xbox</p>
          </div>

          <form className={styles.mobileSearch} onSubmit={handleMobileSearch}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Buscar wallpapers..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        </div>

        <div className={styles.filters}>
          <div className={styles.categories}>
            {CATEGORIES.map(cat => {
              const isActive = tag === cat || (cat === 'Tudo' && !tag)
              return (
                <button 
                  key={cat}
                  className={`${styles.categoryBtn} ${isActive ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {(q || tag) && (
          <div className={styles.resultsInfo}>
            Mostrando resultados para: <strong>{q || tag}</strong> ({totalItems})
          </div>
        )}
      
        {loading ? (
          <Loader text="Buscando wallpapers..." />
        ) : wallpapers.length > 0 ? (
          <>
            <WallpaperGrid wallpapers={wallpapers} onView={handleViewDetails} />
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        ) : (
          <div className={styles.empty}>
            Nenhum wallpaper encontrado. Tente outros termos.
          </div>
        )}
      </div>
    </div>
  )
}
