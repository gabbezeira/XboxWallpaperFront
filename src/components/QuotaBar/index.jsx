import { useAuth } from '../../hooks/useAuth';
import styles from './styles.module.scss';

export default function QuotaBar() {
  const { profile } = useAuth();

  if (!profile) return null;

  const { imageCount = 0, maxImages = 6 } = profile;
  const percentage = (imageCount / maxImages) * 100;

  let state = 'normal';
  if (percentage >= 90) state = 'danger';
  else if (percentage >= 70) state = 'warning';

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <span className={styles.label}>Wallpapers enviados</span>
        <progress
          className={styles.progress}
          value={imageCount}
          max={maxImages}
          data-state={state}
        />
      </div>
      <div className={styles.count}>
        {imageCount}
        <span>/{maxImages}</span>
      </div>
    </div>
  );
}
