import styles from './styles.module.scss';

export default function AdminBadge({ children, variant = 'default', icon: Icon }) {
  return (
    <span className={`${styles.badge} ${styles[variant] || styles.default}`}>
      {Icon && <Icon size={12} className={styles.icon} />}
      <span>{children}</span>
    </span>
  );
}
