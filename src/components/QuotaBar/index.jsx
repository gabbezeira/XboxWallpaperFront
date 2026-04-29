import { useAuth } from '../../hooks/useAuth';
import styles from './styles.module.scss';

export default function QuotaBar() {
  const { profile } = useAuth();

  if (!profile) return null;

  const { imageCount = 0, maxImages = 6 } = profile;
  const percentage = (imageCount / maxImages) * 100;

  let fillClass = styles.fill;
  if (percentage >= 90) fillClass += ` ${styles.fillDanger}`;
  else if (percentage >= 70) fillClass += ` ${styles.fillWarning}`;

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <span className={styles.label}>Wallpapers enviados</span>
        <div className={styles.track}>
          <div className={fillClass} style={{ '--progress': `${percentage}%` }} />
        </div>
      </div>
      <div className={styles.count}>
        {imageCount}
        <span>/{maxImages}</span>
      </div>
    </div>
  );
}
