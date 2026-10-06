import styles from './styles.module.scss';

export default function PageHeader({
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.actions}>{action}</div>}
    </header>
  );
}
