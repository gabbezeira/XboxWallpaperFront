import { useMemo } from 'react';
import { getTierByKey, TIERS, getTierCssClass } from '../../config/tiers';
import styles from './styles.module.scss';

export default function TierBadge({
  tier,
  size = 'medium',
  className = '',
  showIcon = true,
}) {
  const resolvedTier = useMemo(() => {
    if (!tier) return TIERS[0];
    if (typeof tier === 'object' && tier.level) return tier;
    if (typeof tier === 'string') return getTierByKey(tier) || TIERS[0];
    if (typeof tier === 'number') {
      return TIERS.find((t) => t.level === tier) || TIERS[0];
    }
    return TIERS[0];
  }, [tier]);

  const TierIcon = resolvedTier.icon;
  const label = resolvedTier.badgeLabel || resolvedTier.label || resolvedTier.name || 'CADETE';
  const levelClass = styles[getTierCssClass(resolvedTier)];
  const sizeClass = size === 'small' ? styles.small : size === 'large' ? styles.large : '';

  return (
    <div className={`${styles.tierBadge} ${levelClass} ${sizeClass} ${className}`}>
      {showIcon && TierIcon && (
        <TierIcon size={size === 'small' ? 11 : size === 'large' ? 15 : 13} className={styles.badgeIcon} />
      )}
      <span className={styles.badgeLabel}>{label}</span>
      <span className={styles.shimmerEffect} aria-hidden="true" />
    </div>
  );
}
