import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { Check, X, Clock, Layers, User, Calendar, Tag, ShieldCheck, ImageOff } from 'lucide-react';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

const REJECTION_REASONS = [
  'Baixa resolução / Imagem pixelada',
  'Conteúdo inadequado ou ofensivo',
  'Imagem repetida ou duplicada',
  'Marca d\'água excessiva ou texto indesejado',
  'Formato incompatível com tela de TV (não é 16:9)',
];

export default function ModerationQueue({ onApprovedCountChange }) {
  const [wallpapers, setWallpapers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('');
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
      if (onApprovedCountChange) onApprovedCountChange(pendingRes?.length || 0);
    } catch (err) {
      console.error('fetchQueue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (wallpaper, collectionId = null) => {
    try {
      setActionLoading(true);
      await api.admin.approveWallpaper(wallpaper.id, { collectionId });
      setWallpapers((prev) => prev.filter((w) => w.id !== wallpaper.id));
      if (onApprovedCountChange) onApprovedCountChange((wallpapers.length - 1));
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
      setWallpapers((prev) => prev.filter((w) => w.id !== selectedWallpaper.id));
      if (onApprovedCountChange) onApprovedCountChange((wallpapers.length - 1));
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
      <div className={styles.emptyQueue}>
        <div className={styles.emptyQueueIcon}>
          <ShieldCheck size={48} />
        </div>
        <h2 className={styles.emptyQueueTitle}>Fila Limpa!</h2>
        <p className={styles.emptyQueueText}>
          Nenhum wallpaper pendente de aprovação no momento. Novos envios comunitários aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.moderationSection}>
      <div className={styles.moderationHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Moderação Comunitária</h2>
          <p className={styles.sectionSubtitle}>
            {wallpapers.length} {wallpapers.length === 1 ? 'wallpaper aguardando' : 'wallpapers aguardando'} aprovação para publicação pública.
          </p>
        </div>
        <button type="button" className={styles.btnSecondary} onClick={fetchQueue}>
          Atualizar Fila
        </button>
      </div>

      <div className={styles.queueGrid}>
        {wallpapers.map((w) => {
          const thumbSrc = w.thumbUrl?.startsWith('http')
            ? w.thumbUrl
            : `${API_URL}${w.thumbUrl || w.storageUrl}`;

          return (
            <div key={w.id} className={styles.moderationCard}>
              <div className={styles.cardMedia}>
                <img src={thumbSrc} alt={w.title || 'Preview'} className={styles.cardImage} />
                <div className={styles.mediaPills}>
                  {w.width && w.height && (
                    <span className={styles.pill}>{w.width}×{w.height}</span>
                  )}
                  {w.game && (
                    <span className={styles.pill}>{w.game}</span>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{w.title || 'Sem título'}</h3>

                <div className={styles.authorRow}>
                  <div className={styles.authorAvatar}>
                    {w.authorPhoto ? (
                      <img src={w.authorPhoto} alt={w.authorName} className={styles.authorImg} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <span className={styles.authorName}>{w.authorName || 'Usuário'}</span>
                </div>

                {w.tags && w.tags.length > 0 && (
                  <div className={styles.tagList}>
                    {w.tags.map((t) => (
                      <span key={t} className={styles.tagItem}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {collections.length > 0 && (
                  <div className={styles.collectionAssign}>
                    <label className={styles.miniLabel}>
                      <Layers size={12} />
                      <span>Vincular à Coleção:</span>
                    </label>
                    <select
                      className={styles.selectInput}
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                    >
                      <option value="">Nenhuma (Comunidade Geral)</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.btnApprove}
                    disabled={actionLoading}
                    onClick={() => handleApprove(w, selectedCollection || w.collectionId)}
                  >
                    <Check size={16} />
                    <span>Aprovar</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnReject}
                    disabled={actionLoading}
                    onClick={() => promptReject(w)}
                  >
                    <X size={16} />
                    <span>Rejeitar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rejectModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.rejectModal}>
            <h3 className={styles.modalTitle}>Rejeitar Wallpaper</h3>
            <p className={styles.modalDesc}>
              Selecione o motivo da rejeição. O usuário verá essa mensagem no seu painel.
            </p>

            <div className={styles.reasonList}>
              {REJECTION_REASONS.map((reason) => (
                <label key={reason} className={styles.radioOption}>
                  <input
                    type="radio"
                    name="reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="reason"
                  checked={selectedReason === 'Outro'}
                  onChange={() => setSelectedReason('Outro')}
                />
                <span>Outro motivo personalizado</span>
              </label>
            </div>

            {selectedReason === 'Outro' && (
              <textarea
                className={styles.reasonTextarea}
                placeholder="Descreva o motivo da não aprovação..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={200}
              />
            )}

            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setRejectModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmReject}
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
