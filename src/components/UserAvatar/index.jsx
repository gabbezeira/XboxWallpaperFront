import { useEffect, useState } from 'react';
import styles from './styles.module.scss';

export default function UserAvatar({ photoUrl, name = '', size = 'medium' }) {
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [photoUrl]);

  return (
    <div className={`${styles.avatar} ${styles[size] || styles.medium}`}>
      {photoUrl && !photoError ? (
        <img
          src={photoUrl}
          alt={name ? `Foto de ${name}` : ''}
          className={styles.photo}
          referrerPolicy="no-referrer"
          onError={() => setPhotoError(true)}
        />
      ) : (
        <svg viewBox="0 0 24 24" className={styles.placeholderIcon} aria-hidden="true">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
  );
}
