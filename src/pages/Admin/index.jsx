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
  Activity,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Server,
  Database,
  ArrowRight,
} from 'lucide-react';
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
  publish: { label: 'Upload & Lote', section: 'Operações', icon: UploadCloud },
  wallpapers: { label: 'Wallpapers', section: 'Catálogo', icon: Images },
  hero: { label: 'Destaques Hero', section: 'Catálogo', icon: ImageIcon },
  collections: { label: 'Coleções', section: 'Catálogo', icon: Layers },
  users: { label: 'Usuários & Criadores', section: 'Comunidade', icon: Users },
  debug: { label: 'Debug & Observabilidade', section: 'Sistema', icon: Activity },
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

  const fetchOverallStats = async () => {
    try {
      setRefreshing(true);
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
    } catch {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverallStats();
  }, []);

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
          <div className={styles.brandContainer}>
            <div className={styles.brandIconWrapper}>
              <SlidersHorizontal size={18} />
            </div>
            <div className={styles.brandInfo}>
              <span className={styles.brandMainTitle}>Xbox Admin</span>
              <span className={styles.brandVersion}>Console v2.0</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.serverStatusCard}>
          <div className={styles.statusDotLive} />
          <div className={styles.statusTextCol}>
            <span className={styles.statusTitle}>Servidor Conectado</span>
            <span className={styles.statusSubtitle}>Firestore & API Online</span>
          </div>
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
              {stats.pending > 0 ? (
                <span className={styles.pendingBadge}>{stats.pending}</span>
              ) : (
                <span className={styles.cleanBadge}>0</span>
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
              <span className={styles.countBadge}>{stats.totalWallpapers}</span>
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
              <span className={styles.countBadge}>{stats.collectionsCount}</span>
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

            <nav className={styles.breadcrumbNav} aria-label="Navegação em trilha">
              <span className={styles.breadcrumbRoot}>Admin</span>
              <ChevronRight size={14} className={styles.breadcrumbSeparator} />
              <span className={styles.breadcrumbSection}>{currentTabMeta.section}</span>
              <ChevronRight size={14} className={styles.breadcrumbSeparator} />
              <span className={styles.breadcrumbCurrent}>{currentTabMeta.label}</span>
            </nav>
          </div>

          <div className={styles.topHeaderActions}>
            <button
              type="button"
              className={styles.headerActionBtn}
              onClick={fetchOverallStats}
              disabled={refreshing}
              title="Recarregar estatísticas do sistema"
            >
              <RefreshCw size={15} className={refreshing ? styles.spinIcon : ''} />
              <span className={styles.headerActionLabel}>Atualizar</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.headerExitBtn}
              title="Ver plataforma pública"
            >
              <ExternalLink size={15} />
              <span className={styles.headerActionLabel}>Ver App</span>
            </button>
          </div>
        </header>

        <main className={styles.mainViewport}>
          {activeTab === 'overview' && (
            <div className={styles.overviewContainer}>
              <div className={styles.overviewHero}>
                <div className={styles.overviewHeroText}>
                  <h1 className={styles.overviewTitle}>Painel de Controle</h1>
                  <p className={styles.overviewSubtitle}>
                    Gerencie a curadoria de wallpapers, acompanhe o tráfego e configure a experiência da comunidade.
                  </p>
                </div>
                <div className={styles.overviewHeroActions}>
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
                    <span>Revisar Fila ({stats.pending})</span>
                  </button>
                </div>
              </div>

              <section className={styles.kpiGrid}>
                <div
                  className={`${styles.kpiCard} ${styles.kpiInteractive}`}
                  onClick={() => handleSelectTab('moderation')}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Fila de Moderação</span>
                    <div className={styles.kpiIconBox}>
                      <ShieldCheck size={18} />
                    </div>
                  </div>
                  <div className={`${styles.kpiValue} ${stats.pending > 0 ? styles.kpiHighlightDanger : styles.kpiHighlightSuccess}`}>
                    {stats.pending}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>{stats.pending === 0 ? 'Fila 100% revisada' : 'Envios aguardando aprovação'}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div
                  className={`${styles.kpiCard} ${styles.kpiInteractive}`}
                  onClick={() => handleSelectTab('wallpapers')}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Acervo Público</span>
                    <div className={styles.kpiIconBox}>
                      <Images size={18} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.totalWallpapers.toLocaleString('pt-BR')}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>Disponíveis na galeria pública</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div
                  className={`${styles.kpiCard} ${styles.kpiInteractive}`}
                  onClick={() => handleSelectTab('collections')}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Coleções Ativas</span>
                    <div className={styles.kpiIconBox}>
                      <Layers size={18} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.collectionsCount}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>Coleções temáticas e jogos</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div
                  className={`${styles.kpiCard} ${styles.kpiInteractive}`}
                  onClick={() => handleSelectTab('users')}
                >
                  <div className={styles.kpiHeader}>
                    <span className={styles.kpiLabel}>Criadores Verificados</span>
                    <div className={styles.kpiIconBox}>
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className={styles.kpiValue}>
                    {stats.creatorsCount}
                  </div>
                  <div className={styles.kpiFooter}>
                    <span>Comunidade com selo verificado</span>
                    <ArrowRight size={14} />
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
                    >
                      <div className={styles.actionItemIcon}>
                        <UploadCloud size={16} />
                      </div>
                      <div className={styles.actionItemText}>
                        <span className={styles.actionItemTitle}>Ingestão em Lote</span>
                        <span className={styles.actionItemSub}>Carregar pacotes de imagens para uma coleção</span>
                      </div>
                      <ChevronRight size={16} />
                    </div>

                    <div
                      className={styles.moduleActionItem}
                      onClick={() => handleSelectTab('collections')}
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
                      <span className={styles.healthLabel}>Otimizador de Leituras</span>
                      <span className={styles.badgeXbox}>Fase 7 Ativa</span>
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
                    <span>Abrir Painel de Observabilidade</span>
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
