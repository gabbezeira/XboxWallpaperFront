import { useState, memo } from 'react';
import { Trash2 } from 'lucide-react';
import { formatFileSize } from '../../utils/format.js';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

const WallpaperCard = memo(function WallpaperCard({ wallpaper, onView, onDelete, showDelete }) {
  const [loaded, setLoaded] = useState(false);

  const thumbSrc = wallpaper.thumbUrl?.startsWith('http')
    ? wallpaper.thumbUrl
    : `${API_URL}${wallpaper.thumbUrl || wallpaper.storageUrl}`;

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      onClick={() => onView(wallpaper)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onView(wallpaper)}
    >
      {!loaded && <div className={styles.skeleton} />}
      <img
        className={`${styles.image} ${loaded ? styles.loaded : ''}`}
        src={thumbSrc}
        alt={wallpaper.title || 'Wallpaper'}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />

      <div className={styles.overlay}>
        <div className={styles.info}>
          {wallpaper.sizeBytes != null && wallpaper.sizeBytes > 0 && (
            <span className={styles.size}>{formatFileSize(wallpaper.sizeBytes)}</span>
          )}
        </div>

        {showDelete && onDelete && (
          <button
            type="button"
            className={styles.btnDelete}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(wallpaper);
            }}
            aria-label="Excluir wallpaper"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
});

export default WallpaperCard;
