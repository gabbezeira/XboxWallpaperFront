import styles from './styles.module.scss';

export default function VerifiedBadge({ size = 16, className = '', title = 'Criador Verificado' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`${styles.badge} ${className}`}
      title={title}
      aria-label={title}
    >
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        className={styles.star}
      />
      <path
        d="m9 12 2 2 4-4"
        className={styles.check}
      />
    </svg>
  );
}
