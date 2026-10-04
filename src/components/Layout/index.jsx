import { useState, useEffect, useRef } from 'react';
import { Search, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '../../services/auth';
import { getUserLevel } from '../../config/tiers';
import Sidebar from '../Sidebar';
import BottomNav from '../BottomNav';
import UserAvatar from '../UserAvatar';
import SearchBar from '../SearchBar';
import VerifyEmailBanner from '../VerifyEmailBanner';
import styles from './styles.module.scss';

const MOBILE_MAX = 768;
const RESIZE_THROTTLE_MS = 120;
const HIDE_SEARCH_ROUTES = [
  '/upload',
  '/my-wallpapers',
  '/favorites',
  '/my-collection',
  '/terms',
  '/levels',
  '/guide',
];

const HIDE_SEARCH_PREFIXES = ['/wallpaper/'];
const IMMERSIVE_PREFIXES = ['/wallpaper/'];

const KNOWN_ROUTES = [
  '/',
  '/gallery',
  '/collections',
  '/terms',
  '/levels',
  '/guide',
  '/favorites',
  '/my-wallpapers',
  '/upload',
  '/my-collection',
];

const KNOWN_PREFIXES = [
  '/wallpaper/',
  '/collection/',
  '/c/',
];

function isNotFoundRoute(pathname) {
  if (KNOWN_ROUTES.includes(pathname)) return false;
  return !KNOWN_PREFIXES.some((p) => pathname.startsWith(p));
}

export default function Layout({ children, onLoginClick }) {
  const { user, profile, loading } = useAuth();
  const displayName =
    profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const photoURL = profile?.photoURL || user?.photoURL;
  const userLevel = getUserLevel(profile?.totalFavoritesReceived || 0);
  const location = useLocation();
  const is404 = isNotFoundRoute(location.pathname);
  const shouldHideSearch =
    is404 ||
    HIDE_SEARCH_ROUTES.includes(location.pathname) ||
    HIDE_SEARCH_PREFIXES.some((p) => location.pathname.startsWith(p));
  const isImmersive = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_MAX : false,
  );
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const resizeTimer = useRef(0);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => {
        resizeTimer.current = 0;
        setIsMobile(window.innerWidth < MOBILE_MAX);
      }, RESIZE_THROTTLE_MS);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (location.pathname === '/gallery') {
      const qParam = new URLSearchParams(location.search).get('q') || '';
      setSearchQuery(qParam);
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/gallery?q=${encodeURIComponent(trimmed)}`);
      setMobileSearchOpen(false);
    } else if (location.pathname === '/gallery') {
      navigate('/gallery');
      setMobileSearchOpen(false);
    }
  };

  return (
    <div className={styles.layout}>
      {!isImmersive && (isMobile ? (
        <>
          <header className={styles.mobileHeader}>
            {mobileSearchOpen ? (
              <SearchBar
                inputRef={mobileSearchRef}
                variant="mobile"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={handleSearchSubmit}
                onClear={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                placeholder="Buscar Wallpaper"
                autoFocus
              />
            ) : (
              <div className={styles.mobileUserSection}>
                {user ? (
                  <>
                    <Link
                      to="/levels"
                      className={`${styles.mobileAvatarWrapper} ${styles[`tier_${userLevel?.level || 1}`]}`}
                      title={`Nível: ${userLevel?.name || 'Cadete'}`}
                    >
                      <UserAvatar
                        photoUrl={photoURL}
                        name={displayName}
                        size="medium"
                      />
                    </Link>
                    <div className={styles.mobileUserInfo}>
                      <span className={styles.mobileUserName}>
                        {displayName}
                      </span>
                    </div>
                    {!shouldHideSearch && (
                      <button
                        className={styles.mobileActionBtn}
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label="Buscar Wallpaper"
                      >
                        <Search size={18} />
                      </button>
                    )}
                    <button className={styles.mobileActionBtn} onClick={logOut} aria-label="Sair">
                      <LogOut size={18} />
                    </button>
                  </>
                ) : !loading ? (
                  <>
                    <UserAvatar size="medium" />
                    <button className={styles.mobileLoginBtn} onClick={onLoginClick}>
                      Entrar
                    </button>
                    {!shouldHideSearch && (
                      <button
                        className={styles.mobileActionBtn}
                        onClick={() => setMobileSearchOpen(true)}
                        aria-label="Buscar Wallpaper"
                      >
                        <Search size={18} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className={styles.mobileUserSkeleton} />
                )}
              </div>
            )}
          </header>
          <BottomNav onLoginClick={onLoginClick} />
        </>
      ) : (
        <Sidebar onLoginClick={onLoginClick} />
      ))}

      <main className={`${styles.main} ${isImmersive ? styles.immersive : ''} ${is404 ? styles.fullCentered : ''}`}>
        {!isImmersive && <VerifyEmailBanner />}
        {!isMobile && !shouldHideSearch && (
          <div className={styles.topBar}>
            <SearchBar
              variant="topbar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearchSubmit}
              onClear={() => {
                setSearchQuery('');
                if (location.pathname === '/gallery') {
                  navigate('/gallery');
                }
              }}
              placeholder="Buscar Wallpaper"
            />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
