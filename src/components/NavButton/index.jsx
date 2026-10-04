import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './styles.module.scss';

export default function NavButton({
  direction = 'left',
  iconType = 'chevron',
  onClick,
  ariaLabel,
  disabled = false,
  className = '',
  size = 'medium',
  tabIndex = 0,
  ...props
}) {
  const isBack = direction === 'left' || direction === 'prev' || direction === 'back';
  const label = ariaLabel || (isBack ? 'Voltar' : 'Avançar');

  const renderIcon = () => {
    const iconSize = size === 'small' ? 18 : size === 'large' ? 24 : 20;

    if (iconType === 'arrow') {
      return isBack ? <ArrowLeft size={iconSize} /> : <ArrowRight size={iconSize} />;
    }
    return isBack ? <ChevronLeft size={iconSize} /> : <ChevronRight size={iconSize} />;
  };

  return (
    <button
      type="button"
      className={`${styles.navButton} ${styles[size] || ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      tabIndex={tabIndex}
      {...props}
    >
      {renderIcon()}
    </button>
  );
}
