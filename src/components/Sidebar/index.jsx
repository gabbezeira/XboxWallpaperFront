import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Compass, UploadCloud, Heart, LogOut, Images, Layers, Copy, Check } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';
import TierBadge from '../TierBadge';
import UserAvatar from '../UserAvatar';
import VerifyEmailBanner from '../VerifyEmailBanner';
import SupportModal from '../SupportModal';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '../../services/auth';
import { getUserLevel } from '../../config/tiers';
import horizontalLogo from '../../assets/horizontal-logo.png';
import styles from './styles.module.scss';

export default function Sidebar({ onLoginClick }) {
  const { user, profile, loading } = useAuth();
  const [tagCopied, setTagCopied] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

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

        {(user || loading) ? (
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

        {(user || loading) ? (
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

        {(user || loading) ? (
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
            <VerifyEmailBanner variant="sidebar" />
            <div className={styles.userInfo}>
              <UserAvatar photoUrl={photoURL} name={displayName} size="medium" />
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
                    className={styles.levelBadgeLink}
                    title="Ver sistema de níveis e conquistas"
                  >
                    <TierBadge tier={userLevel} size="small" />
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
        ) : !loading && (
          <button className={styles.btnLogin} onClick={onLoginClick}>
            Entrar
          </button>
        )}
        <div className={styles.sidebarFooter}>
          <button className={styles.supportLinkBtn} onClick={() => setSupportOpen(true)}>
            <Heart size={14} fill="currentColor" />
            Apoiar Projeto
          </button>
          <div className={styles.footerLinksRow}>
            <Link to="/guide" className={styles.footerLink}>
              Guia
            </Link>
            <span>&bull;</span>
            <Link to="/levels" className={styles.footerLink}>
              Níveis
            </Link>
            <span>&bull;</span>
            <Link to="/terms" className={styles.footerLink}>
              Termos
            </Link>
          </div>
        </div>
      </div>
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </aside>
  );
}
