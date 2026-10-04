import { useState, useRef, useEffect, memo } from 'react';
import { Trash2, Clock, Lock, AlertCircle, Globe, ChevronDown, Check, Heart } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const thumbSrc = wallpaper.thumbUrl?.startsWith('http')
    ? wallpaper.thumbUrl
    : `${API_URL}${wallpaper.thumbUrl || wallpaper.storageUrl}`;

  const previewSrc = wallpaper.previewUrl
    ? (wallpaper.previewUrl.startsWith('http') ? wallpaper.previewUrl : `${API_URL}${wallpaper.previewUrl}`)
    : (wallpaper.storageUrl?.startsWith('http') ? wallpaper.storageUrl : `${API_URL}${wallpaper.storageUrl}`);

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
        srcSet={previewSrc && previewSrc !== thumbSrc ? `${thumbSrc} 600w, ${previewSrc} 1440w` : undefined}
        sizes="(max-width: 768px) 100vw, (max-width: 1440px) 33vw, (max-width: 2560px) 25vw, 20vw"
        alt={wallpaper.title || 'Wallpaper'}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />

      {showStatus && onToggleVisibility ? (
        <div
          ref={dropdownRef}
          className={styles.visibilityDropdownContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`${styles.visibilityDropdownTrigger} ${
              wallpaper.isPublic
                ? styles.triggerPublic
                : currentStatus === 'pending'
                ? styles.triggerPending
                : currentStatus === 'rejected'
                ? styles.triggerRejected
                : styles.triggerPrivate
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
            aria-expanded={dropdownOpen}
            aria-label="Opções de visibilidade"
          >
            {wallpaper.isPublic ? (
              <>
                <Globe size={12} className={styles.statusIcon} />
                <span>Público</span>
              </>
            ) : currentStatus === 'pending' ? (
              <>
                <Clock size={12} className={styles.statusIcon} />
                <span>Em Análise</span>
              </>
            ) : currentStatus === 'rejected' ? (
              <>
                <AlertCircle size={12} className={styles.statusIcon} />
                <span>Recusado</span>
              </>
            ) : (
              <>
                <Lock size={12} className={styles.statusIcon} />
                <span>Privado</span>
              </>
            )}
            <ChevronDown
              size={12}
              className={`${styles.dropdownCaret} ${dropdownOpen ? styles.caretOpen : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div
              className={styles.visibilityDropdownMenu}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={`${styles.dropdownItem} ${!wallpaper.isPublic ? styles.active : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (wallpaper.isPublic) {
                    onToggleVisibility(wallpaper, false);
                  }
                }}
              >
                <Lock size={13} />
                <span>Privado</span>
                {!wallpaper.isPublic && <Check size={13} className={styles.itemCheck} />}
              </button>

              <button
                type="button"
                className={`${styles.dropdownItem} ${wallpaper.isPublic ? styles.active : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (!wallpaper.isPublic) {
                    onToggleVisibility(wallpaper, true);
                  }
                }}
              >
                <Globe size={13} />
                <span>Público</span>
                {wallpaper.isPublic && <Check size={13} className={styles.itemCheck} />}
              </button>
            </div>
          )}
        </div>
      ) : showStatus ? (
        <div
          className={`${styles.statusBadge} ${
            wallpaper.isPublic || currentStatus === 'approved'
              ? styles.approved
              : styles[currentStatus] || styles.private
          }`}
        >
          {wallpaper.isPublic || currentStatus === 'approved' ? (
            <>
              <Globe size={12} className={styles.statusIcon} />
              <span>Público</span>
            </>
          ) : currentStatus === 'pending' ? (
            <>
              <Clock size={12} className={styles.statusIcon} />
              <span>Em Análise</span>
            </>
          ) : currentStatus === 'rejected' ? (
            <>
              <AlertCircle size={12} className={styles.statusIcon} />
              <span>Recusado</span>
            </>
          ) : (
            <>
              <Lock size={12} className={styles.statusIcon} />
              <span>Privado</span>
            </>
          )}
        </div>
      ) : null}

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
          {!showStatus && (
            <div className={styles.cardFavBadge}>
              <Heart size={12} className={styles.cardFavIcon} fill="currentColor" />
              <span>{wallpaper.favoriteCount || 0}</span>
            </div>
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
