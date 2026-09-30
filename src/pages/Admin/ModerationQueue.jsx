import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Check,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { formatFileSize } from '../../utils/format.js';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

const REJECTION_REASONS = [
  'Baixa resolução / Imagem pixelada',
  'Conteúdo inadequado ou ofensivo',
  'Imagem repetida ou duplicada',
  'Marca d\'água excessiva ou texto indesejado',
  'Formato incompatível com tela de TV (não é 16:9)',
  'Outro',
];

function formatResolution(width, height) {
  if (!width || !height) return '';
  if (width >= 3840) return '4K';
  if (width >= 2560) return '2K';
  if (width >= 1920) return '1080p';
  return `${width}×${height}`;
}

export default function ModerationQueue({ onApprovedCountChange }) {
  const [wallpapers, setWallpapers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [collectionAssignments, setCollectionAssignments] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const [pendingRes, colRes] = await Promise.all([
        api.admin.pendingWallpapers(),
        api.collections.list().catch(() => []),
      ]);
      setWallpapers(pendingRes || []);
      setCollections(colRes || []);
      if (onApprovedCountChange) {
        onApprovedCountChange(pendingRes?.length || 0);
      }
    } catch (err) {
      console.error('fetchQueue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (wallpaper) => {
    try {
      setActionLoading(true);
      const chosenCollectionId = collectionAssignments[wallpaper.id] || null;
      await api.admin.approveWallpaper(wallpaper.id, { collectionId: chosenCollectionId });
      const updated = wallpapers.filter((w) => w.id !== wallpaper.id);
      setWallpapers(updated);
      if (onApprovedCountChange) {
        onApprovedCountChange(updated.length);
      }
    } catch (err) {
      alert(`Erro ao aprovar: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const promptReject = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setSelectedReason(REJECTION_REASONS[0]);
    setCustomReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedWallpaper) return;
    const reason = selectedReason === 'Outro' ? customReason : selectedReason;

    try {
      setActionLoading(true);
      setRejectModalOpen(false);
      await api.admin.rejectWallpaper(selectedWallpaper.id, { reason });
      const updated = wallpapers.filter((w) => w.id !== selectedWallpaper.id);
      setWallpapers(updated);
      if (onApprovedCountChange) {
        onApprovedCountChange(updated.length);
      }
    } catch (err) {
      alert(`Erro ao rejeitar: ${err.message}`);
    } finally {
      setActionLoading(false);
      setSelectedWallpaper(null);
    }
  };

  if (loading) {
    return <Loader text="Carregando fila de moderação..." />;
  }

  if (wallpapers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ShieldCheck size={44} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Fila Limpa</h2>
        <p className={styles.emptyText}>
          Nenhum wallpaper pendente de aprovação no momento. Novos envios comunitários aparecerão aqui automaticamente.
        </p>
        <button type="button" className={styles.btnSecondary} onClick={fetchQueue}>
          <RefreshCw size={14} />
          <span>Verificar novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Fila de Moderação</h2>
          <p className={styles.sectionSubtitle}>
            {wallpapers.length} {wallpapers.length === 1 ? 'wallpaper pendente' : 'wallpapers pendentes'} para avaliação da comunidade.
          </p>
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.btnSecondary} onClick={fetchQueue}>
            <RefreshCw size={14} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      <div className={styles.moderationGrid}>
        {wallpapers.map((w) => {
          const raw = w.thumbUrl || w.storageUrl || '';
          const thumbUrl = raw.startsWith('http')
            ? raw
            : `${API_URL}${raw.includes('thumb=true') ? raw : `${raw}${raw.includes('?') ? '&' : '?'}thumb=true`}`;
          const resLabel = formatResolution(w.width, w.height);

          return (
            <div key={w.id} className={styles.moderationCard}>
              <div className={styles.modImageWrapper}>
                <img src={thumbUrl} alt={w.title} className={styles.modImage} loading="lazy" />
                {resLabel && <span className={styles.modResolutionBadge}>{resLabel}</span>}
              </div>

              <div className={styles.modCardBody}>
                <h3 className={styles.modTitle} title={w.title || 'Sem título'}>
                  {w.title || 'Sem título'}
                </h3>

                <div className={styles.modMetaRow}>
                  <span className={styles.modAuthor}>
                    {w.authorName || 'Autor anônimo'}
                  </span>
                  {w.sizeBytes && (
                    <span title="Tamanho">
                      {formatFileSize(w.sizeBytes)}
                    </span>
                  )}
                </div>

                {Array.isArray(w.tags) && w.tags.length > 0 && (
                  <div className={styles.modTagsList}>
                    {w.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className={styles.modTagPill}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modCardActions}>
                <select
                  value={collectionAssignments[w.id] || ''}
                  onChange={(e) =>
                    setCollectionAssignments((prev) => ({
                      ...prev,
                      [w.id]: e.target.value,
                    }))
                  }
                  className={styles.modColSelect}
                >
                  <option value="">Sem coleção (apenas catálogo público)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      Coleção: {c.name}
                    </option>
                  ))}
                </select>

                <div className={styles.modBtnRow}>
                  <button
                    type="button"
                    className={styles.btnApprove}
                    onClick={() => handleApprove(w)}
                    disabled={actionLoading}
                  >
                    <Check size={14} />
                    <span>Aprovar</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnReject}
                    onClick={() => promptReject(w)}
                    disabled={actionLoading}
                  >
                    <X size={14} />
                    <span>Recusar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rejectModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Recusar Wallpaper</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setRejectModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Motivo da recusa</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className={styles.fieldSelect}
                >
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReason === 'Outro' && (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Descreva o motivo</label>
                  <input
                    type="text"
                    placeholder="Explique o motivo para o criador..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className={styles.fieldInput}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setRejectModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmReject}
                disabled={actionLoading}
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
