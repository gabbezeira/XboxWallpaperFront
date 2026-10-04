import { ImageOff } from 'lucide-react';
import WallpaperCard from '../WallpaperCard';
import EmptyState from '../EmptyState';
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
      <EmptyState
        icon={ImageOff}
        title="Nenhum wallpaper"
        message={emptyMessage || 'Nenhum wallpaper encontrado.'}
      />
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
