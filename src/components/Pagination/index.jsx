import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './styles.module.scss'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Gera array de páginas para exibir. Lógica simples para mostrar páginas próximas.
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className={styles.pagination}>
      <button 
        className={styles.navBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página Anterior"
      >
        <ChevronLeft size={20} />
      </button>

      {startPage > 1 && (
        <>
          <button className={styles.pageBtn} onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
          aria-label={`Página ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <button className={styles.pageBtn} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button 
        className={styles.navBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima Página"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
