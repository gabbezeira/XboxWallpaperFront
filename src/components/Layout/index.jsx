import { useState, useEffect, useRef } from 'react';
import { Search, LogOut, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '../../services/auth';
import Sidebar from '../Sidebar';
import BottomNav from '../BottomNav';
import styles from './styles.module.scss';

const MOBILE_MAX = 768;
const RESIZE_THROTTLE_MS = 120;

import logo from '../../assets/logo.png';

export default function Layout({ children, onLoginClick }) {
  const { user } = useAuth();
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={styles.layout}>
      {isMobile ? (
        <>
          <header className={styles.mobileHeader}>
            {mobileSearchOpen ? (
              <form className={styles.mobileSearchForm} onSubmit={handleSearchSubmit}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder="Buscar wallpapers..."
                  className={styles.mobileSearchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.mobileSearchClose}
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  aria-label="Fechar busca"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <div className={styles.mobileUserSection}>
                {user ? (
                  <>
                    <div
                      className={`${styles.mobileAvatar} ${!user?.photoURL ? styles.mobileAvatarFallback : ''}`}
                    >
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="User"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.insertAdjacentText(
                              'afterend',
                              (user?.displayName || user?.email || 'U').charAt(0).toUpperCase(),
                            );
                          }}
                        />
                      ) : (
                        (user?.displayName || user?.email || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={styles.mobileUserInfo}>
                      <span className={styles.mobileUserName}>
                        {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`${styles.mobileAvatar} ${styles.mobileAvatarFallback}`}>
                      <User size={18} />
                    </div>
                    <button className={styles.mobileLoginBtn} onClick={onLoginClick}>
                      Entrar
                    </button>
                  </>
                )}
                <button
                  className={styles.mobileActionBtn}
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label="Buscar"
                >
                  <Search size={18} />
                </button>
                {user && (
                  <button className={styles.mobileActionBtn} onClick={logOut} aria-label="Sair">
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            )}
          </header>
          <BottomNav onLoginClick={onLoginClick} />
        </>
      ) : (
        <Sidebar onLoginClick={onLoginClick} />
      )}

      <main className={styles.main}>
        {!isMobile && (
          <div className={styles.topBar}>
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar wallpapers, jogos ou tags..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
