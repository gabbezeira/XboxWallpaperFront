import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { Layers, Share2, UploadCloud, ArrowLeft, Check, ExternalLink } from 'lucide-react';
import styles from './styles.module.scss';

const ITEMS_PER_PAGE = 24;

export default function MyCollection() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [wallpaperToDelete, setWallpaperToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [visibilityModal, setVisibilityModal] = useState({
    open: false,
    wallpaper: null,
    nextIsPublic: false,
  });
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const fetchMine = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.collections.mine();
      setCollection(res.collection);
      setWallpapers(res.wallpapers || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar sua coleção');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
  }, []);

  const handleShare = () => {
    if (!collection?.slug) return;
    const url = `${window.location.origin}/collection/${collection.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPublicView = () => {
    if (!collection?.slug) return;
    navigate(`/collection/${collection.slug}`);
  };

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
  };

  const promptDelete = (wallpaper) => {
    setWallpaperToDelete(wallpaper);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!wallpaperToDelete) return;
    try {
      setDeleting(true);
      setIsModalOpen(false);
      await api.collections.removeWallpaperFromMine(wallpaperToDelete.id);
      await fetchMine();
    } catch (err) {
      alert(err.message || 'Erro ao remover wallpaper da coleção');
    } finally {
      setDeleting(false);
      setWallpaperToDelete(null);
    }
  };

  const promptToggleVisibility = (wallpaper, explicitNextPublic) => {
    const isCurrentlyPublic =
      wallpaper.isPublic || wallpaper.status === 'approved' || wallpaper.status === 'pending';
    const nextIsPublic = explicitNextPublic !== undefined ? explicitNextPublic : !isCurrentlyPublic;
    if (nextIsPublic === isCurrentlyPublic) return;
    setVisibilityModal({
      open: true,
      wallpaper,
      nextIsPublic,
    });
  };

  const confirmToggleVisibility = async () => {
    if (!visibilityModal.wallpaper) return;

    try {
      setUpdatingVisibility(true);
      const targetId = visibilityModal.wallpaper.id;
      const nextPublic = visibilityModal.nextIsPublic;
      setVisibilityModal({ open: false, wallpaper: null, nextIsPublic: false });

      await api.wallpapers.updateVisibility(targetId, nextPublic);
      await fetchMine();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Erro ao alterar visibilidade');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const cancelToggleVisibility = () => {
    setVisibilityModal({ open: false, wallpaper: null, nextIsPublic: false });
  };

  const totalPages = useMemo(() => Math.ceil(wallpapers.length / ITEMS_PER_PAGE), [wallpapers.length]);
  const paginatedWallpapers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return wallpapers.slice(start, start + ITEMS_PER_PAGE);
  }, [wallpapers, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Loader text="Carregando sua coleção..." />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Layers size={48} />
            </div>
            <h2 className={styles.emptyTitle}>Coleção Oficial Não Vinculada</h2>
            <p className={styles.emptyText}>
              Você ainda não possui uma coleção oficial atribuída à sua conta de Criador. Entre em contato com a equipe informando sua Gamertag ou perfil para solicitar uma coleção dedicada.
            </p>
            <div className={styles.emptyActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => navigate('/my-wallpapers')}
                tabIndex={0}
              >
                Gerenciar Meus Wallpapers
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => navigate('/levels')}
                tabIndex={0}
              >
                Ver Requisitos de Patente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <button
              type="button"
              className={styles.btnBack}
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              tabIndex={0}
            >
              <ArrowLeft size={20} />
            </button>
            <div className={styles.headerInfo}>
              <div className={styles.headerBadgeRow}>
                <span className={styles.collectionBadge}>Painel do Criador</span>
                <span className={styles.slugBadge}>/{collection.slug}</span>
              </div>
              <h1 className={styles.title}>{collection.name}</h1>
              {collection.description && (
                <p className={styles.subtitle}>{collection.description}</p>
              )}
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnGhostAction}
              onClick={handleOpenPublicView}
              tabIndex={0}
              title="Abrir página pública da coleção"
            >
              <ExternalLink size={16} />
              <span>Ver Página Pública</span>
            </button>

            <button
              type="button"
              className={styles.btnShare}
              onClick={handleShare}
              tabIndex={0}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              className={styles.btnAdd}
              onClick={() => navigate('/upload')}
              tabIndex={0}
            >
              <UploadCloud size={16} />
              <span>Novo Wallpaper</span>
            </button>
          </div>
        </header>

        <section className={styles.dashboardStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{wallpapers.length}</span>
            <span className={styles.statLabel}>Total na Coleção</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {wallpapers.filter((w) => w.status === 'approved' || w.isPublic).length}
            </span>
            <span className={styles.statLabel}>Públicos na Galeria</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {wallpapers.filter((w) => w.status === 'pending').length}
            </span>
            <span className={styles.statLabel}>Em Moderação</span>
          </div>
        </section>

        <div className={styles.gridSection}>
          <WallpaperGrid
            wallpapers={paginatedWallpapers}
            onView={handleViewDetails}
            onDelete={promptDelete}
            onToggleVisibility={promptToggleVisibility}
            showDelete={true}
            showStatus={true}
            emptyMessage="Nenhum wallpaper adicionado a esta coleção ainda. Clique em 'Novo Wallpaper' para começar."
            maxColumns={6}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Remover da Coleção"
        message="Deseja desvincular este wallpaper da sua coleção? A imagem permanecerá na sua galeria pessoal de uploads."
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsModalOpen(false);
          setWallpaperToDelete(null);
        }}
        confirmText="Remover da Coleção"
        cancelText="Cancelar"
        variant="danger"
      />

      <Modal
        isOpen={visibilityModal.open}
        title={
          visibilityModal.nextIsPublic
            ? 'Tornar Wallpaper Público'
            : 'Tornar Wallpaper Privado'
        }
        message={
          visibilityModal.nextIsPublic
            ? 'Ao tornar público, o wallpaper passará pela moderação comunitária antes de ser visível no catálogo geral.'
            : 'Ao tornar privado, o wallpaper será visível apenas para você no seu acervo pessoal.'
        }
        onConfirm={confirmToggleVisibility}
        onCancel={cancelToggleVisibility}
        confirmText={
          visibilityModal.nextIsPublic
            ? 'Sim, Tornar Público'
            : 'Sim, Tornar Privado'
        }
        cancelText="Cancelar"
      />

      {deleting && (
        <div className={styles.overlayLoader}>
          <Loader text="Removendo da coleção..." />
        </div>
      )}

      {updatingVisibility && (
        <div className={styles.overlayLoader}>
          <Loader text="Atualizando visibilidade..." />
        </div>
      )}
    </div>
  );
}
