import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'
import WallpaperGrid from '../../components/WallpaperGrid'
import Pagination from '../../components/Pagination'
import EmptyState from '../../components/EmptyState'
import Loader from '../../components/Loader'
import styles from './styles.module.scss'

const ITEMS_PER_PAGE = 12

export default function Favorites() {
  const { favorites, loading } = useFavorites()
  const navigate = useNavigate()
  
  const [currentPage, setCurrentPage] = useState(1)

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } })
  }

  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE)

  // Proteção: se excluir o último item da última página, volta uma página
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedFavorites = favorites.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Favoritos</h1>
            <p className={styles.subtitle}>Sua coleção pessoal de papéis de parede preferidos.</p>
          </div>
        </header>

        {loading ? (
          <Loader text="Carregando favoritos..." />
        ) : favorites.length === 0 ? (
          <div className={styles.emptyContainer}>
            <EmptyState 
              title="Nenhum favorito ainda" 
              message="Explore a galeria e clique no ícone de coração para salvar seus wallpapers preferidos aqui." 
              icon={Heart} 
            />
          </div>
        ) : (
          <>
            <WallpaperGrid
              wallpapers={paginatedFavorites}
              onView={handleViewDetails}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
