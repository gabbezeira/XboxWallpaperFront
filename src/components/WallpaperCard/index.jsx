import { useState, memo } from 'react'
import { Trash2 } from 'lucide-react'
import { formatFileSize } from '../../utils/format.js'
import styles from './styles.module.scss'

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '')

const WallpaperCard = memo(function WallpaperCard({ wallpaper, onView, onDelete, showDelete }) {
  const [loaded, setLoaded] = useState(false)

  const thumbSrc = wallpaper.thumbUrl?.startsWith('http')
    ? wallpaper.thumbUrl
    : `${API_URL}${wallpaper.thumbUrl || wallpaper.storageUrl}`

  return (
    <button type="button" className={styles.card} onClick={() => onView(wallpaper)}>
      {!loaded && <div className={styles.skeleton} />}
      <img
        className={`${styles.image} ${loaded ? styles.loaded : ''}`}
        src={thumbSrc}
        alt="Wallpaper"
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      <div className={styles.overlay}>
        <div className={styles.info}>
          {wallpaper.sizeBytes != null && wallpaper.sizeBytes > 0 && (
            <span className={styles.size}>{formatFileSize(wallpaper.sizeBytes)}</span>
          )}
        </div>

        {showDelete && onDelete && (
          <div
            className={styles.btnDelete}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(wallpaper)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onDelete(wallpaper)}
          >
            <Trash2 size={16} />
          </div>
        )}
      </div>
    </button>
  )
})

export default WallpaperCard
