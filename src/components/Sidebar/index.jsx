import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Compass, UploadCloud, Heart, LogOut, Images, Layers, Copy, Check } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '../../services/auth';
import { getUserLevel, getTierCssClass } from '../../config/tiers';
import horizontalLogo from '../../assets/horizontal-logo.png';
import styles from './styles.module.scss';

export default function Sidebar({ onLoginClick }) {
  const { user, profile } = useAuth();
  const [tagCopied, setTagCopied] = useState(false);

  const navClass = ({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`;

  const displayName =
    profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const photoURL = profile?.photoURL || user?.photoURL;
  const userLevel = getUserLevel(profile?.totalFavoritesReceived || 0);

  const handleCopyTag = (e) => {
    e.stopPropagation();
    if (!profile?.userTag) return;
    navigator.clipboard.writeText(profile.userTag);
    setTagCopied(true);
    setTimeout(() => setTagCopied(false), 2000);
  };

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.brand} tabIndex={0}>
        <img src={horizontalLogo} alt="Spartan Wallpapers" className={styles.brandLogo} />
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
        <NavLink to="/collections" className={navClass}>
          <Layers size={20} />
          Coleções
        </NavLink>

        {user ? (
          <NavLink to="/favorites" className={navClass}>
            <Heart size={20} fill="currentColor" />
            Favoritos
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick}>
            <Heart size={20} fill="currentColor" />
            Favoritos
          </button>
        )}

        {user ? (
          <NavLink to="/upload" className={navClass}>
            <UploadCloud size={20} />
            Enviar
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick}>
            <UploadCloud size={20} />
            Enviar
          </button>
        )}

        {user ? (
          <NavLink to="/my-wallpapers" className={navClass}>
            <Images size={20} />
            Meus Wallpapers
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick}>
            <Images size={20} />
            Meus Wallpapers
          </button>
        )}

        {Boolean(user && (profile?.role === 'creator' || profile?.assignedCollectionId)) && (
          <NavLink to="/my-collection" className={navClass}>
            <Layers size={20} />
            Minha Coleção
          </NavLink>
        )}
      </nav>

      <div className={styles.userSection}>
        {user ? (
          <>
            <div className={styles.userInfo}>
              <div className={`${styles.avatar} ${!photoURL ? styles.avatarWithColor : ''}`}>
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className={styles.avatarImg}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.insertAdjacentText(
                        'afterend',
                        displayName.charAt(0).toUpperCase(),
                      );
                    }}
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userNameRow}>
                  <span className={styles.userName}>{displayName}</span>
                  {Boolean(profile?.isVerified) && (
                    <VerifiedBadge size={16} className={styles.verifiedBadge} />
                  )}
                </div>
                {Boolean(profile?.userTag) && (
                  <button
                    type="button"
                    className={styles.userTagBtn}
                    onClick={handleCopyTag}
                    title="Clique para copiar sua Tag"
                  >
                    <span className={styles.userTagText}>{profile.userTag}</span>
                    {tagCopied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
                <div className={styles.profileStatsRow}>
                  <Link
                    to="/levels"
                    className={`${styles.badge} ${styles[getTierCssClass(userLevel)]}`}
                    title="Ver sistema de níveis e conquistas"
                  >
                    {userLevel.label}
                  </Link>
                  <div className={styles.profileFavBadge} title="Total de Favoritos Recebidos">
                    <Heart size={10} fill="currentColor" />
                    <span>{profile?.totalFavoritesReceived || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className={styles.btnLogout} onClick={logOut}>
              <LogOut size={16} />
              Sair
            </button>
          </>
        ) : (
          <button className={styles.btnLogin} onClick={onLoginClick}>
            Entrar
          </button>
        )}
        <div className={styles.sidebarFooter}>
          <Link to="/guide" className={styles.footerLink}>
            Guia de Uso
          </Link>
          <Link to="/levels" className={styles.footerLink}>
            Níveis &amp; Badges
          </Link>
          <Link to="/terms" className={styles.footerLink}>
            Termos &amp; Privacidade
          </Link>
        </div>
      </div>
    </aside>
  );
}
