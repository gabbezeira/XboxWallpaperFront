import { PackageOpen } from 'lucide-react';
import styles from './styles.module.scss';

export default function EmptyState({ title, message, icon: Icon = PackageOpen }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <Icon size={48} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
