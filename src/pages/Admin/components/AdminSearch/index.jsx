import { Search } from 'lucide-react';
import styles from './styles.module.scss';

export default function AdminSearch({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar...',
  disabled = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchBox}>
      <Search size={16} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.input}
      />
    </form>
  );
}
