import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  UploadCloud,
  Layers,
  Users,
  Images,
  LogOut,
  Image as ImageIcon,
  CheckCircle2,
  Activity,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Server,
  ArrowRight,
} from 'lucide-react';
import horizontalLogo from '../../assets/horizontal-logo.png';
import PageHeader from '../../components/PageHeader';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import ModerationQueue from './ModerationQueue';
import OfficialPublish from './OfficialPublish';
import ManageCollections from './ManageCollections';
import ManageUsers from './ManageUsers';
import ManageWallpapers from './ManageWallpapers';
import ManageHeroSlides from './ManageHeroSlides';
import DebugMetrics from './DebugMetrics';
import styles from './styles.module.scss';

const TAB_CONFIG = {
  overview: { label: 'Visão Geral', section: 'Painel', icon: LayoutDashboard },
  moderation: { label: 'Moderação', section: 'Operações', icon: ShieldCheck },
  publish: { label: 'Upload em Lote', section: 'Operações', icon: UploadCloud },
  wallpapers: { label: 'Wallpapers', section: 'Catálogo', icon: Images },
  hero: { label: 'Destaques Hero', section: 'Catálogo', icon: ImageIcon },
  collections: { label: 'Coleções', section: 'Catálogo', icon: Layers },
  users: { label: 'Usuários & Criadores', section: 'Comunidade', icon: Users },
  debug: { label: 'Métricas do Sistema', section: 'Sistema', icon: Activity },
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_tab') || 'overview';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    pending: 0,
    totalWallpapers: 0,
    collectionsCount: 0,
    creatorsCount: 0,
  });

  const fetchOverallStats = async (force = false) => {
    try {
      setRefreshing(true);
      const [pendingRes, galleryRes, colsRes, usersRes] = await Promise.allSettled([
        api.admin.pendingWallpapers(),
        api.wallpapers.list({ limit: 1 }),
        api.collections.list(),
        api.admin.listUsers({ page: 1, limit: 1, force }),
      ]);

      const pendingList = pendingRes.status === 'fulfilled' ? pendingRes.value : [];
      const galleryData = galleryRes.status === 'fulfilled' ? galleryRes.value : {};
      const colsList = colsRes.status === 'fulfilled' ? colsRes.value : [];
      const usersData = usersRes.status === 'fulfilled' ? usersRes.value : {};

      const verifiedCount = usersData?.verifiedCount ?? (
        Array.isArray(usersData)
          ? usersData.filter((u) => u.isVerified || u.role === 'creator').length
          : (usersData?.users?.filter((u) => u.isVerified || u.role === 'creator').length || 0)
      );

      setStats({
        pending: Array.isArray(pendingList) ? pendingList.length : 0,
        totalWallpapers: galleryData?.totalItems || 0,
        collectionsCount: Array.isArray(colsList) ? colsList.length : 0,
        creatorsCount: verifiedCount,
      });
    } catch (err) {
      console.error('fetchOverallStats error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverallStats();
    }
  }, [activeTab]);

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem('admin_tab', tabKey);
    setMobileMenuOpen(false);
  };

  const handlePendingCountUpdate = (newCount) => {
    setStats((prev) => ({
      ...prev,
      pending: newCount,
    }));
  };

  const currentTabMeta = TAB_CONFIG[activeTab] || TAB_CONFIG.overview;
  const adminName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Administrador';
  const adminPhoto = profile?.photoURL || user?.photoURL || null;

  return (
    <div className={styles.adminShell}>
      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.brandLink}>
            <img src={horizontalLogo} alt="Spartan Wallpapers" className={styles.brandLogo} />
          </Link>
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Painel</span>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'overview' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('overview')}
            >
              <LayoutDashboard size={18} />
              <span>Visão Geral</span>
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Operações</span>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'moderation' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('moderation')}
            >
              <ShieldCheck size={18} />
              <span>Moderação</span>
              {stats.pending > 0 && (
                <span className={styles.navBadgeAlert}>{stats.pending}</span>
              )}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'publish' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('publish')}
            >
              <UploadCloud size={18} />
              <span>Upload & Lote</span>
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Catálogo</span>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'wallpapers' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('wallpapers')}
            >
              <Images size={18} />
              <span>Wallpapers</span>
              {stats.totalWallpapers > 0 && (
                <span className={styles.navBadgeCount}>{stats.totalWallpapers}</span>
              )}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'hero' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('hero')}
            >
              <ImageIcon size={18} />
              <span>Destaques Hero</span>
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'collections' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('collections')}
            >
              <Layers size={18} />
              <span>Coleções</span>
              {stats.collectionsCount > 0 && (
                <span className={styles.navBadgeCount}>{stats.collectionsCount}</span>
              )}
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Comunidade</span>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'users' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('users')}
            >
              <Users size={18} />
              <span>Usuários & Criadores</span>
            </button>
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Sistema</span>
            <button
              type="button"
              className={`${styles.navItem} ${activeTab === 'debug' ? styles.navItemActive : ''}`}
              onClick={() => handleSelectTab('debug')}
            >
              <Activity size={18} />
              <span>Debug & Métricas</span>
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfileCard}>
            <div className={styles.userAvatarWrapper}>
              {adminPhoto ? (
                <img
                  src={adminPhoto}
                  alt={adminName}
                  className={styles.userAvatarImg}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={styles.userAvatarFallback}>
                  {adminName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName} title={adminName}>{adminName}</span>
              <span className={styles.userRole}>Administrador</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.btnExitPlatform}
            title="Sair do painel e voltar para a galeria pública"
          >
            <LogOut size={16} />
            <span>Voltar ao App</span>
          </button>
        </div>
      </aside>

      <div className={styles.contentShell}>
        <header className={styles.topHeader}>
          <div className={styles.topHeaderLeft}>
            <button
              type="button"
              className={styles.menuToggleBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu lateral"
            >
              <Menu size={20} />
            </button>

            <div className={styles.topHeaderTitleArea}>
              <span className={styles.topHeaderSection}>{currentTabMeta.section}</span>
              <span className={styles.topHeaderDivider}>/</span>
              <span className={styles.topHeaderCurrent}>{currentTabMeta.label}</span>
            </div>
          </div>

          <div className={styles.topHeaderActions}>
            {activeTab === 'overview' && (
              <button
                type="button"
                onClick={() => fetchOverallStats(true)}
                className={styles.headerActionBtn}
                title="Atualizar métricas da visão geral"
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? styles.spinIcon : ''} />
                <span className={styles.headerActionLabel}>
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.headerExitBtn}
              title="Ver plataforma pública"
            >
              <ExternalLink size={15} />
              <span className={styles.headerActionLabel}>Ver Galeria</span>
            </button>
          </div>
        </header>

        <main className={styles.mainViewport}>
          {activeTab === 'overview' && (
            <div className={styles.overviewContainer}>
              <PageHeader
                kicker="PAINEL ADMINISTRATIVO"
                title="Visão Geral"
                subtitle="Gerencie a curadoria de wallpapers, acompanhe o tráfego e configure a experiência da comunidade."
                action={
                  <div className={styles.overviewHeaderActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => handleSelectTab('publish')}
                    >
                      <UploadCloud size={16} />
                      <span>Upload em Lote</span>
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => handleSelectTab('moderation')}
                    >
                      <ShieldCheck size={16} />
                      <span>Fila de Moderação {stats.pending > 0 ? `(${stats.pending})` : ''}</span>
                    </button>
                  </div>
                }
              />

              <section className={styles.kpiGrid}>
                <div
                  className={styles.kpiCard}
                  onClick={() => handleSelectTab('moderation')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Fila de Moderação</span>
                    <ShieldCheck size={18} className={stats.pending > 0 ? styles.kpiIconAlert : styles.kpiIconSuccess} />
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.pending}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span className={stats.pending > 0 ? styles.kpiStatusAlert : styles.kpiStatusClean}>
                      {stats.pending === 0 ? 'Fila zerada' : 'Aguardando aprovação'}
                    </span>
                    <ArrowRight size={14} className={styles.kpiArrow} />
                  </div>
                </div>

                <div
                  className={styles.kpiCard}
                  onClick={() => handleSelectTab('wallpapers')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Acervo Público</span>
                    <Images size={18} className={styles.kpiIconNeutral} />
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.totalWallpapers.toLocaleString('pt-BR')}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>Wallpapers publicados</span>
                    <ArrowRight size={14} className={styles.kpiArrow} />
                  </div>
                </div>

                <div
                  className={styles.kpiCard}
                  onClick={() => handleSelectTab('collections')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Coleções Ativas</span>
                    <Layers size={18} className={styles.kpiIconNeutral} />
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.collectionsCount}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>Coleções temáticas e jogos</span>
                    <ArrowRight size={14} className={styles.kpiArrow} />
                  </div>
                </div>

                <div
                  className={styles.kpiCard}
                  onClick={() => handleSelectTab('users')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Criadores Verificados</span>
                    <CheckCircle2 size={18} className={styles.kpiIconSuccess} />
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.creatorsCount}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>Comunidade com selo verificado</span>
                    <ArrowRight size={14} className={styles.kpiArrow} />
                  </div>
                </div>
              </section>

              <div className={styles.overviewCardsRow}>
                <div className={styles.overviewModuleCard}>
                  <div className={styles.moduleCardHeader}>
                    <Sparkles size={18} />
                    <h3>Ações Rápidas de Curadoria</h3>
                  </div>
                  <div className={styles.moduleActionList}>
                    <div
                      className={styles.moduleActionItem}
                      onClick={() => handleSelectTab('hero')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.actionItemIcon}>
                        <ImageIcon size={16} />
                      </div>
                      <div className={styles.actionItemText}>
                        <span className={styles.actionItemTitle}>Organizar Destaques Hero</span>
                        <span className={styles.actionItemSub}>Definir ordem e banners da página inicial</span>
                      </div>
                      <ChevronRight size={16} />
                    </div>

                    <div
                      className={styles.moduleActionItem}
                      onClick={() => handleSelectTab('publish')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.actionItemIcon}>
                        <UploadCloud size={16} />
                      </div>
                      <div className={styles.actionItemText}>
                        <span className={styles.actionItemTitle}>Upload em Lote</span>
                        <span className={styles.actionItemSub}>Carregar pacotes de imagens para uma coleção</span>
                      </div>
                      <ChevronRight size={16} />
                    </div>

                    <div
                      className={styles.moduleActionItem}
                      onClick={() => handleSelectTab('collections')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.actionItemIcon}>
                        <Layers size={16} />
                      </div>
                      <div className={styles.actionItemText}>
                        <span className={styles.actionItemTitle}>Criar Nova Coleção</span>
                        <span className={styles.actionItemSub}>Configurar novos títulos e jogos no catálogo</span>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>

                <div className={styles.overviewModuleCard}>
                  <div className={styles.moduleCardHeader}>
                    <Server size={18} />
                    <h3>Saúde e Infraestrutura</h3>
                  </div>
                  <div className={styles.systemHealthList}>
                    <div className={styles.healthRow}>
                      <span className={styles.healthLabel}>Autenticação Firebase</span>
                      <span className={styles.badgeSuccess}>Operacional</span>
                    </div>
                    <div className={styles.healthRow}>
                      <span className={styles.healthLabel}>Caches em Memória (Node.js)</span>
                      <span className={styles.badgeSuccess}>Ativos (5 camadas)</span>
                    </div>
                    <div className={styles.healthRow}>
                      <span className={styles.healthLabel}>Armazenamento Firebase Storage</span>
                      <span className={styles.badgeSuccess}>Operacional</span>
                    </div>
                    <div className={styles.healthRow}>
                      <span className={styles.healthLabel}>Cota Diária Spark</span>
                      <span className={styles.healthValue}>50.000 reads/dia</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => handleSelectTab('debug')}
                  >
                    <Activity size={15} />
                    <span>Ver Métricas do Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <ModerationQueue onApprovedCountChange={handlePendingCountUpdate} />
          )}

          {activeTab === 'publish' && (
            <OfficialPublish onPublishComplete={fetchOverallStats} />
          )}

          {activeTab === 'wallpapers' && (
            <ManageWallpapers />
          )}

          {activeTab === 'hero' && (
            <ManageHeroSlides />
          )}

          {activeTab === 'collections' && (
            <ManageCollections />
          )}

          {activeTab === 'users' && (
            <ManageUsers />
          )}

          {activeTab === 'debug' && (
            <DebugMetrics />
          )}
        </main>
      </div>
    </div>
  );
}
