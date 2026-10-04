import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import styles from './styles.module.scss';

export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Buscar Wallpaper',
  className = '',
  variant = 'default',
  autoFocus = false,
  inputRef,
  id,
}) {
  const localRef = useRef(null);
  const activeRef = inputRef || localRef;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
    if (activeRef.current) {
      activeRef.current.focus();
    }
  };

  return (
    <form
      className={`${styles.searchBar} ${styles[variant] || ''} ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <Search size={variant === 'topbar' ? 20 : 18} className={styles.searchIcon} />
      <input
        ref={activeRef}
        id={id}
        type="text"
        placeholder={placeholder}
        className={styles.searchInput}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
      />
      {Boolean(value) && (
        <button
          type="button"
          className={styles.searchClear}
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
