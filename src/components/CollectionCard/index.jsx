import { useState } from 'react';
import { Layers, Check, Copy, ArrowRight } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import VerifiedBadge from '../VerifiedBadge';
import styles from './styles.module.scss';

export default function CollectionCard({
  collection,
  onClick,
  onCopyCode,
  isCopied = false,
  className = '',
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const displayCode =
    collection.code ||
    collection.slug?.toUpperCase() ||
    `COL-${collection.id?.slice(0, 5).toUpperCase()}`;

  const hasLinkedUser = Boolean(collection.linkedUserName);
  const linkedUserName = collection.linkedUserName || 'Spartan Wallpapers';
  const linkedUserVerified = hasLinkedUser ? collection.linkedUserVerified : true;

  const handleCopyClick = (e) => {
    e.stopPropagation();
    if (onCopyCode) {
      onCopyCode(e, displayCode);
    } else {
      navigator.clipboard.writeText(displayCode);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.card} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Coleção ${collection.name}`}
    >
      <div className={styles.bannerWrapper}>
        {collection.bannerUrl ? (
          <>
            {!imgLoaded && <div className={styles.skeleton} />}
            <img
              src={collection.bannerUrl}
              alt=""
              className={`${styles.bannerImg} ${imgLoaded ? styles.loaded : ''}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className={styles.bannerFallback}>
            <Layers size={36} />
          </div>
        )}
        <div className={styles.bannerGradient} />

        <button
          type="button"
          className={`${styles.btnCode} ${isCopied ? styles.copied : ''}`}
          onClick={handleCopyClick}
          onKeyDown={(e) => e.stopPropagation()}
          title="Copiar código de busca"
          aria-label={`Copiar código ${displayCode}`}
          tabIndex={0}
        >
          {isCopied ? <Check size={12} /> : <Copy size={12} />}
          <span>{isCopied ? 'Copiado!' : displayCode}</span>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{collection.name}</h3>
          {collection.description && (
            <p className={styles.description}>{collection.description}</p>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.creator} title={`Criador: ${linkedUserName}`}>
            <UserAvatar
              photoUrl={hasLinkedUser ? collection.linkedUserPhoto : null}
              name={linkedUserName}
              size="small"
            />
            <span className={styles.creatorName}>{linkedUserName}</span>
            {linkedUserVerified && <VerifiedBadge size={13} />}
          </div>

          <div className={styles.viewBadge}>
            <span>Ver</span>
            <ArrowRight size={13} className={styles.viewArrow} />
          </div>
        </div>
      </div>
    </div>
  );
}
