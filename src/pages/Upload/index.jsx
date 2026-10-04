import { useNavigate } from 'react-router-dom';
import UploadZone from '../../components/UploadZone';
import QuotaBar from '../../components/QuotaBar';
import PageHeader from '../../components/PageHeader';
import { Images } from 'lucide-react';
import styles from './styles.module.scss';

export default function UploadPage() {
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    navigate('/my-wallpapers');
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          kicker="Gerenciamento de Mídia"
          title="Enviar Wallpaper"
          subtitle="Envie papéis de parede em alta resolução para seu console ou compartilhe com a comunidade"
          action={
            <button
              type="button"
              className={styles.btnMyWallpapers}
              onClick={() => navigate('/my-wallpapers')}
            >
              <Images size={16} />
              <span>Ver Meus Wallpapers</span>
            </button>
          }
        />

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
