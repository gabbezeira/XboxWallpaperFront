import { NavLink } from 'react-router-dom';
import { Home, Compass, UploadCloud, Heart, Images } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './styles.module.scss';

export default function BottomNav({ onLoginClick }) {
  const { user } = useAuth();

  const navClass = ({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`;

  return (
    <nav className={styles.bottomNav}>
      <NavLink to="/" className={navClass} end>
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/gallery" className={navClass}>
        <Compass size={20} />
        <span>Explorar</span>
      </NavLink>

      {user ? (
        <NavLink to="/upload" className={navClass}>
          <UploadCloud size={20} />
          <span>Enviar</span>
        </NavLink>
      ) : (
        <button className={styles.navItem} onClick={onLoginClick}>
          <UploadCloud size={20} />
          <span>Enviar</span>
        </button>
      )}

      {user ? (
        <NavLink to="/favorites" className={navClass}>
          <Heart size={20} />
          <span>Favoritos</span>
        </NavLink>
      ) : (
        <button className={styles.navItem} onClick={onLoginClick}>
          <Heart size={20} />
          <span>Favoritos</span>
        </button>
      )}

      {user ? (
        <NavLink to="/my-wallpapers" className={navClass}>
          <Images size={20} />
          <span>Meus</span>
        </NavLink>
      ) : (
        <button className={styles.navItem} onClick={onLoginClick}>
          <Images size={20} />
          <span>Meus</span>
        </button>
      )}
    </nav>
  );
}
