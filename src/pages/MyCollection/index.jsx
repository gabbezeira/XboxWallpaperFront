import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import WallpaperGrid from '../../components/WallpaperGrid';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { Layers, Share2, UploadCloud, ArrowLeft, Check, Sparkles } from 'lucide-react';
import styles from './styles.module.scss';

export default function MyCollection() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [copied, setCopied] = useState(false);
  const [wallpaperToDelete, setWallpaperToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  if (loading) {
    return (
      <div className={styles.page}>
        <Loader text="Carregando sua coleção oficial..." />
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
            <h2 className={styles.emptyTitle}>Coleção não atribuída</h2>
            <p className={styles.emptyText}>
              Você ainda não possui uma coleção oficial vinculada à sua conta de Criador. Entre em contato com a administração informando sua Tag para configurar sua Coleção oficial.
            </p>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate('/my-wallpapers')}
            >
              Ir para Meus Wallpapers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.btnBack}
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.headerInfo}>
            <div className={styles.creatorBadge}>
              <Sparkles size={14} />
              <span>Sua Coleção Oficial</span>
            </div>
            <h1 className={styles.title}>{collection.name}</h1>
            {collection.description && (
              <p className={styles.subtitle}>{collection.description}</p>
            )}
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnShare}
              onClick={handleShare}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copied ? 'Link Copiado!' : 'Compartilhar Coleção'}</span>
            </button>
            <button
              type="button"
              className={styles.btnAdd}
              onClick={() => navigate('/upload')}
            >
              <UploadCloud size={16} />
              <span>Adicionar Wallpaper</span>
            </button>
          </div>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{wallpapers.length}</span>
            <span className={styles.statLabel}>Wallpapers na Coleção</span>
          </div>
        </div>

        <div className={styles.gridSection}>
          <WallpaperGrid
            wallpapers={wallpapers}
            onView={handleViewDetails}
            onDelete={promptDelete}
            showDelete={true}
            showStatus={true}
            emptyMessage="Nenhum wallpaper adicionado a esta coleção ainda. Clique em 'Adicionar Wallpaper' para começar!"
            maxColumns={6}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Remover da Coleção"
        message="Deseja desvincular este wallpaper da sua coleção oficial? A imagem continuará no seu acervo pessoal."
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsModalOpen(false);
          setWallpaperToDelete(null);
        }}
        confirmText="Remover da Coleção"
        cancelText="Cancelar"
        variant="danger"
      />

      {deleting && (
        <div className={styles.overlayLoader}>
          <Loader text="Removendo da coleção..." />
        </div>
      )}
    </div>
  );
}
