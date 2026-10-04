import { PackageOpen } from 'lucide-react';
import styles from './styles.module.scss';

export default function EmptyState({
  title,
  message,
  icon: Icon = PackageOpen,
  children,
  className = '',
}) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      <div className={styles.iconWrapper}>
        <Icon size={36} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
