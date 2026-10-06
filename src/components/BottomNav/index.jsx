import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  UploadCloud,
  Heart,
  Images,
  MoreHorizontal,
  BookOpen,
  Award,
  ShieldCheck,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SupportModal from '../SupportModal';
import styles from './styles.module.scss';

export default function BottomNav({ onLoginClick }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const menuRef = useRef(null);

  const isMoreActive = ['/guide', '/levels', '/terms', '/collections'].includes(location.pathname);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('pointerdown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const navClass = ({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`;

  return (
    <>
      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}

      {isMenuOpen && (
        <div ref={menuRef} className={styles.popoverMenu} role="dialog" aria-label="Menu Adicional">
          <div className={styles.popoverHeader}>
            <span className={styles.popoverTitle}>Central da Comunidade</span>
            <button
              type="button"
              className={styles.popoverCloseBtn}
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu"
              tabIndex={0}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.popoverLinks}>
            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
              }
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              <div className={styles.menuLinkIcon}>
                <Layers size={18} />
              </div>
              <div className={styles.menuLinkText}>
                <span className={styles.menuLinkLabel}>Coleções &amp; Códigos</span>
                <span className={styles.menuLinkDesc}>Buscar por acervo ou código rápido</span>
              </div>
            </NavLink>

            <NavLink
              to="/guide"
              className={({ isActive }) =>
                `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
              }
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              <div className={styles.menuLinkIcon}>
                <BookOpen size={18} />
              </div>
              <div className={styles.menuLinkText}>
                <span className={styles.menuLinkLabel}>Guia de Uso</span>
                <span className={styles.menuLinkDesc}>Fluxo no Xbox, celular e envio</span>
              </div>
            </NavLink>

            <NavLink
              to="/levels"
              className={({ isActive }) =>
                `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
              }
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              <div className={styles.menuLinkIcon}>
                <Award size={18} />
              </div>
              <div className={styles.menuLinkText}>
                <span className={styles.menuLinkLabel}>Níveis &amp; Badges</span>
                <span className={styles.menuLinkDesc}>Patentes, favoritos e cotas</span>
              </div>
            </NavLink>

            <NavLink
              to="/terms"
              className={({ isActive }) =>
                `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
              }
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              <div className={styles.menuLinkIcon}>
                <ShieldCheck size={18} />
              </div>
              <div className={styles.menuLinkText}>
                <span className={styles.menuLinkLabel}>Termos de Uso</span>
                <span className={styles.menuLinkDesc}>Diretrizes e privacidade</span>
              </div>
            </NavLink>

            <button
              className={styles.menuLink}
              onClick={() => {
                setIsMenuOpen(false);
                setSupportOpen(true);
              }}
              tabIndex={0}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <div className={styles.menuLinkIcon} style={{ color: '#00ab00', borderColor: 'rgba(0, 171, 0, 0.3)', backgroundColor: 'rgba(0, 171, 0, 0.1)' }}>
                <Heart size={18} fill="currentColor" />
              </div>
              <div className={styles.menuLinkText}>
                <span className={styles.menuLinkLabel} style={{ color: '#00ab00' }}>Apoiar Projeto</span>
                <span className={styles.menuLinkDesc}>Ajude a manter os servidores ativos</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <nav className={styles.bottomNav}>
        <NavLink to="/" className={navClass} end tabIndex={0}>
          <Home size={19} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/gallery" className={navClass} tabIndex={0}>
          <Compass size={19} />
          <span>Explorar</span>
        </NavLink>

        {(user || loading) ? (
          <NavLink to="/upload" className={navClass} tabIndex={0}>
            <UploadCloud size={19} />
            <span>Enviar</span>
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick} tabIndex={0}>
            <UploadCloud size={19} />
            <span>Enviar</span>
          </button>
        )}

        {(user || loading) ? (
          <NavLink to="/favorites" className={navClass} tabIndex={0}>
            <Heart size={19} />
            <span>Favoritos</span>
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick} tabIndex={0}>
            <Heart size={19} />
            <span>Favoritos</span>
          </button>
        )}

        {(user || loading) ? (
          <NavLink to="/my-wallpapers" className={navClass} tabIndex={0}>
            <Images size={19} />
            <span>Meus</span>
          </NavLink>
        ) : (
          <button className={styles.navItem} onClick={onLoginClick} tabIndex={0}>
            <Images size={19} />
            <span>Meus</span>
          </button>
        )}

        <button
          type="button"
          className={`${styles.navItem} ${isMoreActive || isMenuOpen ? styles.active : ''}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Mais opções"
          tabIndex={0}
        >
          <MoreHorizontal size={19} />
          <span>Mais</span>
        </button>
      </nav>

      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
