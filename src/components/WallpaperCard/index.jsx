import { useState, memo } from 'react';
import { Trash2, Clock, CheckCircle2, Lock, AlertCircle, Globe } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';
import { formatFileSize } from '../../utils/format.js';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

const WallpaperCard = memo(function WallpaperCard({
  wallpaper,
  onView,
  onDelete,
  showDelete,
  showStatus,
  onToggleVisibility,
}) {
  const [loaded, setLoaded] = useState(false);

  const thumbSrc = wallpaper.thumbUrl?.startsWith('http')
    ? wallpaper.thumbUrl
    : `${API_URL}${wallpaper.thumbUrl || wallpaper.storageUrl}`;

  const currentStatus = wallpaper.status || (wallpaper.isPublic ? 'approved' : 'private');

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

      {showStatus && (
        <div className={`${styles.statusBadge} ${styles[currentStatus] || styles.private}`}>
          {currentStatus === 'approved' && (
            <>
              <CheckCircle2 size={12} />
              <span>Público</span>
            </>
          )}
          {currentStatus === 'pending' && (
            <>
              <Clock size={12} />
              <span>Em Análise</span>
            </>
          )}
          {currentStatus === 'rejected' && (
            <>
              <AlertCircle size={12} />
              <span>Recusado</span>
            </>
          )}
          {currentStatus === 'private' && (
            <>
              <Lock size={12} />
              <span>Privado</span>
            </>
          )}
        </div>
      )}

      {showStatus && onToggleVisibility && (
        <button
          type="button"
          className={styles.visibilityBadgeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(wallpaper);
          }}
          title={wallpaper.isPublic ? 'Tornar privado' : 'Tornar público'}
          aria-label="Mudar visibilidade"
        >
          {wallpaper.isPublic ? (
            <>
              <Lock size={12} />
              <span>Privar</span>
            </>
          ) : (
            <>
              <Globe size={12} />
              <span>Publicar</span>
            </>
          )}
        </button>
      )}

      <div className={styles.overlay}>
        <div className={styles.info}>
          {wallpaper.authorName && !showStatus && (
            <div className={styles.authorBadge}>
              <span className={styles.authorName}>{wallpaper.authorName}</span>
              {wallpaper.isVerified && <VerifiedBadge size={13} className={styles.verifiedIcon} />}
            </div>
          )}
          {wallpaper.sizeBytes != null && wallpaper.sizeBytes > 0 && (
            <span className={styles.size}>{formatFileSize(wallpaper.sizeBytes)}</span>
          )}
        </div>

        <div className={styles.actions}>
          {onToggleVisibility && (
            <button
              type="button"
              className={styles.btnAction}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(wallpaper);
              }}
              title={wallpaper.isPublic ? 'Tornar privado' : 'Tornar público'}
              aria-label="Mudar visibilidade"
            >
              {wallpaper.isPublic ? <Lock size={16} /> : <Globe size={16} />}
            </button>
          )}

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
    </div>
  );
});

export default WallpaperCard;
