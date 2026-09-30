import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallpapers } from '../../hooks/useWallpapers';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import QuotaBar from '../../components/QuotaBar';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { UploadCloud } from 'lucide-react';
import styles from './styles.module.scss';

export default function MyWallpapers() {
  const { refreshProfile } = useAuth();
  const { wallpapers, loading, refetch } = useWallpapers();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallpaperToDelete, setWallpaperToDelete] = useState(null);
  const [visibilityModal, setVisibilityModal] = useState({
    open: false,
    wallpaper: null,
    nextIsPublic: false,
  });
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [deleting, setDeleting] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const handleViewDetails = (wallpaper) => {
    navigate(`/wallpaper/${wallpaper.id}`, { state: { wallpaper } });
  };

  const promptDelete = (wallpaper) => {
    setWallpaperToDelete(wallpaper);
    setIsModalOpen(true);
  };

  const promptToggleVisibility = (wallpaper) => {
    const isCurrentlyPublic =
      wallpaper.isPublic || wallpaper.status === 'approved' || wallpaper.status === 'pending';
    setVisibilityModal({
      open: true,
      wallpaper,
      nextIsPublic: !isCurrentlyPublic,
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
      await refetch();
      await refreshProfile();
    } catch (err) {
      setErrorModal({
        open: true,
        title: 'Erro ao alterar visibilidade',
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const cancelToggleVisibility = () => {
    setVisibilityModal({ open: false, wallpaper: null, nextIsPublic: false });
  };

  const confirmDelete = async () => {
    if (!wallpaperToDelete) return;

    try {
      setDeleting(true);
      setIsModalOpen(false);
      await api.wallpapers.remove(wallpaperToDelete.id);

      await refreshProfile();
      await refetch();
    } catch (err) {
      setErrorModal({
        open: true,
        title: 'Erro ao deletar',
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setDeleting(false);
      setWallpaperToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setWallpaperToDelete(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Meus Wallpapers</h1>
            <p className={styles.subtitle}>Gerencie suas imagens para usar no Xbox</p>
          </div>
          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.btnUpload}
              onClick={() => navigate('/upload')}
            >
              <UploadCloud size={18} />
              <span>Enviar Wallpaper</span>
            </button>
            <QuotaBar />
          </div>
        </div>

        {loading ? (
          <Loader text="Carregando seus wallpapers..." />
        ) : (
          <WallpaperGrid
            wallpapers={wallpapers}
            onDelete={promptDelete}
            onToggleVisibility={promptToggleVisibility}
            showDelete={true}
            showStatus={true}
            onView={handleViewDetails}
            maxColumns={6}
          />
        )}
      </div>

      <Modal
        isOpen={visibilityModal.open}
        title={
          visibilityModal.nextIsPublic
            ? 'Tornar Wallpaper Público'
            : 'Tornar Wallpaper Privado'
        }
        message={
          visibilityModal.nextIsPublic
            ? 'Ao tornar público, seu wallpaper será enviado para moderação antes de aparecer na galeria pública para outros usuários.'
            : 'Ao tornar privado, este wallpaper ficará visível somente para você nesta aba de Meus Wallpapers.'
        }
        onConfirm={confirmToggleVisibility}
        onCancel={cancelToggleVisibility}
        confirmText={
          visibilityModal.nextIsPublic ? 'Tornar Público' : 'Tornar Privado'
        }
        cancelText="Cancelar"
        variant="primary"
      />

      <Modal
        isOpen={isModalOpen}
        title="Deletar Wallpaper"
        message="Tem certeza que deseja deletar este wallpaper? Esta ação não pode ser desfeita e abrirá espaço para novos envios."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Deletar Imagem"
        cancelText="Cancelar"
        variant="danger"
      />

      <Modal
        isOpen={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onConfirm={() => setErrorModal({ ...errorModal, open: false })}
        confirmText="Entendido"
        variant="danger"
      />

      {(deleting || updatingVisibility) && (
        <div className={styles.overlayLoader}>
          <Loader
            text={
              deleting
                ? 'Removendo sua imagem...'
                : 'Atualizando visibilidade...'
            }
          />
        </div>
      )}
    </div>
  );
}
