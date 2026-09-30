import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UploadCloud,
  Layers,
  Users,
  Images,
  LogOut,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../services/api';
import ModerationQueue from './ModerationQueue';
import OfficialPublish from './OfficialPublish';
import ManageCollections from './ManageCollections';
import ManageUsers from './ManageUsers';
import ManageWallpapers from './ManageWallpapers';
import ManageHeroSlides from './ManageHeroSlides';
import styles from './styles.module.scss';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('moderation');
  const [pendingCount, setPendingCount] = useState(0);
  const [catalogSubTab, setCatalogSubTab] = useState('wallpapers');

  useEffect(() => {
    api.admin.pendingWallpapers()
      .then((data) => {
        setPendingCount(data?.length || 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.topNavWrapper}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Painel de Administração</h1>
            <p className={styles.lead}>
              Moderação comunitária, uploads em lote para coleções, controle de criadores e acervo.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" onClick={() => navigate('/')} className={styles.btnGhost}>
              <LogOut size={16} aria-hidden /> Sair do painel
            </button>
          </div>
        </header>

        <nav className={styles.tabs} aria-label="Seções do painel">
          <button
            type="button"
            className={`${styles.btnTab} ${activeTab === 'moderation' ? styles.btnTabActive : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <ShieldCheck size={16} aria-hidden />
            <span>Moderação</span>
            {pendingCount > 0 && <span className={styles.tabBadge}>{pendingCount}</span>}
          </button>

          <button
            type="button"
            className={`${styles.btnTab} ${activeTab === 'publish' ? styles.btnTabActive : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            <UploadCloud size={16} aria-hidden />
            <span>Publicar & Lote</span>
          </button>

          <button
            type="button"
            className={`${styles.btnTab} ${activeTab === 'collections' ? styles.btnTabActive : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            <Layers size={16} aria-hidden />
            <span>Coleções</span>
          </button>

          <button
            type="button"
            className={`${styles.btnTab} ${activeTab === 'users' ? styles.btnTabActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} aria-hidden />
            <span>Usuários & Creators</span>
          </button>

          <button
            type="button"
            className={`${styles.btnTab} ${activeTab === 'catalog' ? styles.btnTabActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Images size={16} aria-hidden />
            <span>Acervo Geral</span>
          </button>
        </nav>
      </div>

      <main className={styles.main}>
        {activeTab === 'moderation' && (
          <ModerationQueue onApprovedCountChange={(count) => setPendingCount(count)} />
        )}

        {activeTab === 'publish' && (
          <OfficialPublish onPublishComplete={() => {}} />
        )}

        {activeTab === 'collections' && (
          <ManageCollections />
        )}

        {activeTab === 'users' && (
          <ManageUsers />
        )}

        {activeTab === 'catalog' && (
          <div className={styles.catalogContainer}>
            <div className={styles.subTabs}>
              <button
                type="button"
                className={`${styles.btnSubTab} ${catalogSubTab === 'wallpapers' ? styles.btnSubTabActive : ''}`}
                onClick={() => setCatalogSubTab('wallpapers')}
              >
                <Images size={15} />
                <span>Wallpapers Cadastrados</span>
              </button>
              <button
                type="button"
                className={`${styles.btnSubTab} ${catalogSubTab === 'hero' ? styles.btnSubTabActive : ''}`}
                onClick={() => setCatalogSubTab('hero')}
              >
                <ImageIcon size={15} />
                <span>Hero Slides (Destaques)</span>
              </button>
            </div>

            {catalogSubTab === 'wallpapers' && <ManageWallpapers />}
            {catalogSubTab === 'hero' && <ManageHeroSlides />}
          </div>
        )}
      </main>
    </div>
  );
}
