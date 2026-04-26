import { NavLink, Link } from 'react-router-dom'
import { Home, Compass, UploadCloud, Heart, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import logo from '../../assets/logo.png'
import styles from './styles.module.scss'

export default function Sidebar({ onLoginClick }) {
  const { user, profile } = useAuth()

  const navClass = ({ isActive }) => 
    `${styles.navItem} ${isActive ? styles.active : ''}`

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuário'
  const photoURL = profile?.photoURL || user?.photoURL

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.brand} tabIndex={0}>
        <img src={logo} alt="Xbox Wallpapers" className={styles.brandIcon} />
        <span>Xbox Wallpapers</span>
      </Link>

      <nav className={styles.nav}>
        <NavLink to="/" className={navClass} end>
          <Home size={20} />
          Home
        </NavLink>
        <NavLink to="/gallery" className={navClass}>
          <Compass size={20} />
          Explorar
        </NavLink>

        
        {user ? (
          <NavLink to="/favorites" className={navClass}>
            <Heart size={20} />
            Favoritos
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick}>
            <Heart size={20} />
            Favoritos
          </button>
        )}

        {user ? (
          <NavLink to="/my-wallpapers" className={navClass}>
            <UploadCloud size={20} />
            Seus Wallpapers
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick}>
            <UploadCloud size={20} />
            Seus Wallpapers
          </button>
        )}
      </nav>

      <div className={styles.userSection}>
        {user ? (
          <>
            <div className={styles.userInfo}>
              <div className={`${styles.avatar} ${!photoURL ? styles.avatarWithColor : ''}`}>
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className={styles.avatarImg} />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{displayName}</div>
                <div className={styles.badge}>ULTIMATE</div>
              </div>
            </div>
            <button className={styles.btnLogout} onClick={() => signOut(auth)}>
              <LogOut size={16} />
              Sair
            </button>
          </>
        ) : (
          <button className={styles.btnLogin} onClick={onLoginClick}>
            Entrar
          </button>
        )}
      </div>
    </aside>
  )
}
