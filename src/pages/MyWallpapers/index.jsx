import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallpapers } from '../../hooks/useWallpapers';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import UploadZone from '../../components/UploadZone';
import QuotaBar from '../../components/QuotaBar';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import styles from './styles.module.scss';

export default function MyWallpapers() {
  const { refreshProfile } = useAuth();
  const { wallpapers, loading, refetch } = useWallpapers();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallpaperToDelete, setWallpaperToDelete] = useState(null);
  const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });
  const [deleting, setDeleting] = useState(false);

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
      await api.wallpapers.remove(wallpaperToDelete.id);

      // Sincroniza o perfil e os wallpapers localmente
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
          <QuotaBar />
        </div>

        <div className={styles.uploadSection}>
          <UploadZone
            onUploadComplete={async () => {
              await refreshProfile();
              await refetch();
            }}
          />
        </div>

        {loading ? (
          <Loader text="Carregando seus wallpapers..." />
        ) : (
          <WallpaperGrid
            wallpapers={wallpapers}
            onDelete={promptDelete}
            showDelete={true}
            onView={handleViewDetails}
            maxColumns={6}
          />
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
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

      {/* Modal de Erro */}
      <Modal
        isOpen={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        onConfirm={() => setErrorModal({ ...errorModal, open: false })}
        confirmText="Entendido"
        variant="danger"
      />

      {deleting && (
        <div className={styles.overlayLoader}>
          <Loader text="Removendo sua imagem..." />
        </div>
      )}
    </div>
  );
}
