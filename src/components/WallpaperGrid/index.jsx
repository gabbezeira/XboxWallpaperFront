import { ImageOff } from 'lucide-react';
import WallpaperCard from '../WallpaperCard';
import styles from './styles.module.scss';

export default function WallpaperGrid({
  wallpapers,
  onView,
  onDelete,
  showDelete,
  showStatus,
  onToggleVisibility,
  emptyMessage,
  maxColumns,
}) {
  if (wallpapers.length === 0) {
    return (
      <div className={styles.grid} data-max-columns={maxColumns || 6}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <ImageOff size={48} strokeWidth={1.5} />
          </div>
          <h3 className={styles.emptyTitle}>Nenhum wallpaper</h3>
          <p className={styles.emptyText}>{emptyMessage || 'Nenhum wallpaper encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.grid} data-max-columns={maxColumns || 6}>
      {wallpapers.map((wallpaper, index) => (
        <WallpaperCard
          key={wallpaper.id || index}
          wallpaper={wallpaper}
          onView={onView}
          onDelete={onDelete}
          showDelete={showDelete}
          showStatus={showStatus}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
}
