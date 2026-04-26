import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WallpaperCard from '../WallpaperCard'
import styles from './styles.module.scss'

export default function RowSlider({ title, items, loading, onVerTudo, onView }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [checkScroll, items])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {onVerTudo && (
          <button className={styles.btnVerTudo} onClick={onVerTudo}>
            VER TUDO
          </button>
        )}
      </div>

      <div className={styles.sliderWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={() => scroll('left')}
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div className={styles.grid} ref={scrollRef}>
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(idx => (
              <div key={idx} className={styles.item}>
                <div className={styles.skeletonCard} />
              </div>
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <WallpaperCard wallpaper={item} onView={onView} />
              </div>
            ))
          ) : (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>Nenhum wallpaper encontrado em "{title}".</p>
            </div>
          )}
        </div>

        {canScrollRight && (
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={() => scroll('right')}
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  )
}
