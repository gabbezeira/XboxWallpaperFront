import styles from './styles.module.scss';

export default function AdminHeader({ title, subtitle, badge, children }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{title}</h2>
          {badge !== undefined && badge !== null && (
            <span className={styles.badge}>{badge}</span>
          )}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
