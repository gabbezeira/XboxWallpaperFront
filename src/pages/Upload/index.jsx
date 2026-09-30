import { useNavigate } from 'react-router-dom';
import UploadZone from '../../components/UploadZone';
import QuotaBar from '../../components/QuotaBar';
import { ArrowLeft, Images } from 'lucide-react';
import styles from './styles.module.scss';

export default function UploadPage() {
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    navigate('/my-wallpapers');
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <button
              type="button"
              className={styles.btnBack}
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>Enviar Wallpaper</h1>
              <p className={styles.subtitle}>
                Envie papéis de parede em alta resolução para seu console ou compartilhe com a comunidade
              </p>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnMyWallpapers}
              onClick={() => navigate('/my-wallpapers')}
            >
              <Images size={16} />
              <span>Ver Meus Wallpapers</span>
            </button>
          </div>
        </div>

        <div className={styles.quotaWrapper}>
          <QuotaBar />
        </div>

        <div className={styles.uploadArea}>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>
      </div>
    </div>
  );
}
