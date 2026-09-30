import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import { Trash2, Image as ImageIcon, X } from 'lucide-react';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

function slideImageSrc(slide) {
  if (!slide?.imageUrl) return '';
  if (slide.imageUrl.startsWith('http')) return slide.imageUrl;
  return `${API_URL}${slide.imageUrl.startsWith('/') ? '' : '/'}${slide.imageUrl}`;
}

export default function ManageHeroSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  const fetchSlides = async () => {
    try {
      setLoadError('');
      setLoading(true);
      const data = await api.heroSlides.listManage();
      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao listar destaques:', err);
      setLoadError('Não foi possível carregar os slides do hero.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    setDeletingId(id);

    try {
      await api.heroSlides.remove(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Não foi possível excluir o slide.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loader text="Carregando destaques do hero..." />;
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Hero Slides em Destaque</h2>
          <p className={styles.sectionSubtitle}>
            Estes slides aparecem no carrossel dinâmico no topo da página inicial (Home).
          </p>
        </div>
      </div>

      {loadError && (
        <div className={styles.batchActionText}>
          <span>{loadError}</span>
        </div>
      )}

      {slides.length === 0 && !loadError ? (
        <div className={styles.emptyState}>
          <ImageIcon size={44} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Nenhum Slide Cadastrado</h3>
          <p className={styles.emptyText}>
            Use a aba &quot;Publicar & Lote&quot; &gt; &quot;Hero Slide&quot; para enviar novos destaques para a página inicial.
          </p>
        </div>
      ) : (
        <div className={styles.heroSlidesGrid}>
          {slides.map((s) => {
            const src = slideImageSrc(s);
            return (
              <div key={s.id} className={styles.heroSlideCard}>
                <img src={src} alt="" className={styles.heroSlideBanner} />
                <div className={styles.heroSlideBody}>
                  <div className={styles.heroSlideDetails}>
                    <h3 className={styles.heroSlideTitle}>{s.title || 'Sem título'}</h3>
                    {s.subtitle && (
                      <p className={styles.heroSlideSubtitle}>{s.subtitle}</p>
                    )}
                    {s.targetTag && (
                      <span className={styles.kpiSub}>Tag: #{s.targetTag}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.btnDangerIconSmall}
                    onClick={() => setConfirmModal({ open: true, id: s.id })}
                    disabled={deletingId === s.id}
                    title="Excluir Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmModal.open && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal({ open: false, id: null })}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Excluir Hero Slide</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setConfirmModal({ open: false, id: null })}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.emptyText}>
                Tem certeza que deseja remover este slide do carrossel principal?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setConfirmModal({ open: false, id: null })}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Excluindo...' : 'Excluir Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
