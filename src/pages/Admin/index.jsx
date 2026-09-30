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
  CheckCircle2,
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
  const [catalogSubTab, setCatalogSubTab] = useState('wallpapers');

  const [stats, setStats] = useState({
    pending: 0,
    totalWallpapers: 0,
    collectionsCount: 0,
    creatorsCount: 0,
  });

  const fetchOverallStats = async () => {
    try {
      const [pendingRes, galleryRes, colsRes, usersRes] = await Promise.allSettled([
        api.admin.pendingWallpapers(),
        api.wallpapers.list({ limit: 1 }),
        api.collections.list(),
        api.admin.listUsers({ limit: 100 }),
      ]);

      const pendingList = pendingRes.status === 'fulfilled' ? pendingRes.value : [];
      const galleryData = galleryRes.status === 'fulfilled' ? galleryRes.value : {};
      const colsList = colsRes.status === 'fulfilled' ? colsRes.value : [];
      const usersList = usersRes.status === 'fulfilled' ? usersRes.value : [];

      const verifiedCount = Array.isArray(usersList)
        ? usersList.filter((u) => u.isVerified || u.role === 'creator').length
        : 0;

      setStats({
        pending: pendingList?.length || 0,
        totalWallpapers: galleryData?.totalItems || 0,
        collectionsCount: colsList?.length || 0,
        creatorsCount: verifiedCount,
      });
    } catch (err) {
      void err;
    }
  };

  useEffect(() => {
    fetchOverallStats();
  }, []);

  const handlePendingCountUpdate = (newCount) => {
    setStats((prev) => ({
      ...prev,
      pending: newCount,
    }));
  };

  return (
    <div className={styles.adminContainer}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.brandGroup}>
            <h1 className={styles.brandTitle}>Painel de controle</h1>
          </div>

          <div className={styles.topBarActions}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.btnExit}
            >
              <LogOut size={15} />
              <span>Voltar à plataforma</span>
            </button>
          </div>
        </div>

        <nav className={styles.navBar} aria-label="Navegação do painel">
          <button
            type="button"
            className={`${styles.navTab} ${activeTab === 'moderation' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <ShieldCheck size={16} />
            <span>Moderação</span>
            {stats.pending > 0 && (
              <span className={styles.tabBadge}>{stats.pending}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.navTab} ${activeTab === 'publish' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            <UploadCloud size={16} />
            <span>Publicar & Lote</span>
          </button>

          <button
            type="button"
            className={`${styles.navTab} ${activeTab === 'collections' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            <Layers size={16} />
            <span>Coleções</span>
          </button>

          <button
            type="button"
            className={`${styles.navTab} ${activeTab === 'users' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            <span>Usuários & Criadores</span>
          </button>

          <button
            type="button"
            className={`${styles.navTab} ${activeTab === 'catalog' ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Images size={16} />
            <span>Acervo Geral</span>
          </button>
        </nav>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Fila de Moderação</span>
              <ShieldCheck size={16} />
            </div>
            <div
              className={`${styles.kpiValue} ${stats.pending > 0 ? styles.kpiValueHighlight : ''}`}
            >
              {stats.pending}
            </div>
            <span className={styles.kpiSub}>
              {stats.pending === 0 ? 'Fila 100% revisada' : 'Aguardando aprovação'}
            </span>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Acervo Público</span>
              <Images size={16} />
            </div>
            <div className={styles.kpiValue}>{stats.totalWallpapers}</div>
            <span className={styles.kpiSub}>Disponíveis na galeria</span>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Coleções Ativas</span>
              <Layers size={16} />
            </div>
            <div className={styles.kpiValue}>{stats.collectionsCount}</div>
            <span className={styles.kpiSub}>Coleções Organizadas</span>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Criadores Verificados</span>
              <CheckCircle2 size={16} />
            </div>
            <div className={styles.kpiValue}>{stats.creatorsCount}</div>
            <span className={styles.kpiSub}>Comunidade ativa</span>
          </div>
        </section>

        {activeTab === 'moderation' && (
          <ModerationQueue onApprovedCountChange={handlePendingCountUpdate} />
        )}

        {activeTab === 'publish' && (
          <OfficialPublish onPublishComplete={fetchOverallStats} />
        )}

        {activeTab === 'collections' && <ManageCollections />}

        {activeTab === 'users' && <ManageUsers />}

        {activeTab === 'catalog' && (
          <div className={styles.viewContainer}>
            <div className={styles.toolbar}>
              <div className={styles.subSegment}>
                <button
                  type="button"
                  className={`${styles.subSegmentBtn} ${catalogSubTab === 'wallpapers' ? styles.subSegmentActive : ''}`}
                  onClick={() => setCatalogSubTab('wallpapers')}
                >
                  <Images size={14} />
                  <span>Wallpapers ({stats.totalWallpapers})</span>
                </button>
                <button
                  type="button"
                  className={`${styles.subSegmentBtn} ${catalogSubTab === 'hero' ? styles.subSegmentActive : ''}`}
                  onClick={() => setCatalogSubTab('hero')}
                >
                  <ImageIcon size={14} />
                  <span>Hero Slides da Home</span>
                </button>
              </div>
            </div>

            {catalogSubTab === 'wallpapers' && <ManageWallpapers />}
            {catalogSubTab === 'hero' && <ManageHeroSlides />}
          </div>
        )}
      </main>
    </div>
  );
}
