import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { auth } from '../../services/firebase';
import {
  UploadCloud,
  Layers,
  X,
  Check,
  AlertCircle,
  FileImage,
  Sparkles,
} from 'lucide-react';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

function cleanFileNameToTitle(fileName) {
  if (!fileName) return '';
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  const spaced = withoutExt.replace(/[-_.]+/g, ' ');
  return spaced
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function OfficialPublish({ onPublishComplete }) {
  const [collections, setCollections] = useState([]);
  const [batchFiles, setBatchFiles] = useState([]);
  const [targetCollectionId, setTargetCollectionId] = useState('');
  const [globalGame, setGlobalGame] = useState('');
  const [globalTags, setGlobalTags] = useState('');
  const [titlePrefix, setTitlePrefix] = useState('');
  const [uploadingBatch, setUploadingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ total: 0, completed: 0, current: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.collections.list().then((res) => {
      setCollections(res || []);
    }).catch(() => {});
  }, []);

  const handleFilesSelected = (filesList) => {
    const valid = Array.from(filesList).filter((f) =>
      f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp)$/i)
    );

    const mapped = valid.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      title: cleanFileNameToTitle(file.name),
      status: 'idle',
      error: null,
    }));

    setBatchFiles((prev) => [...prev, ...mapped]);
  };

  const handleRemoveFile = (id) => {
    setBatchFiles((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleApplyPrefix = () => {
    if (!titlePrefix.trim()) return;
    setBatchFiles((prev) =>
      prev.map((item) => ({
        ...item,
        title: item.title.startsWith(titlePrefix)
          ? item.title
          : `${titlePrefix.trim()} - ${item.title}`,
      }))
    );
  };

  const handleStartBatchUpload = async () => {
    if (batchFiles.length === 0 || uploadingBatch) return;

    setUploadingBatch(true);
    setBatchProgress({ total: batchFiles.length, completed: 0, current: 'Iniciando...' });

    const tagsArray = globalTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const queue = [...batchFiles];
    let completedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'success') continue;

      setBatchProgress({
        total: queue.length,
        completed: completedCount,
        current: `Enviando (${i + 1}/${queue.length}): ${item.title}...`,
      });

      setBatchFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
      );

      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Não autenticado');
        const token = await user.getIdToken();

        const formData = new FormData();
        formData.append('image', item.file);
        formData.append('title', item.title || 'Sem título');
        if (globalGame.trim()) formData.append('game', globalGame.trim());
        if (targetCollectionId) formData.append('collectionId', targetCollectionId);
        if (tagsArray.length > 0) formData.append('tags', JSON.stringify(tagsArray));

        const res = await fetch(`${API_URL}/api/wallpapers/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        completedCount++;
        setBatchFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'success' } : f))
        );
      } catch (err) {
        setBatchFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error', error: err.message } : f
          )
        );
      }
    }

    setBatchProgress({
      total: queue.length,
      completed: completedCount,
      current: `Concluído! ${completedCount} de ${queue.length} enviados.`,
    });
    setUploadingBatch(false);
    if (onPublishComplete) onPublishComplete();
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Publicação e Upload em Lote</h2>
          <p className={styles.sectionSubtitle}>
            Faça upload em massa de múltiplos papéis de parede para o acervo oficial com tags e coleções unificadas.
          </p>
        </div>
      </div>

      <div className={styles.publishGrid}>
        <div className={styles.publishConfigCard}>
          <div className={styles.configCardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Layers size={18} />
            </div>
            <div>
              <h3 className={styles.configCardTitle}>Configurações do Lote</h3>
              <p className={styles.configCardSub}>Metadados aplicados aos envios</p>
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Coleção Alvo</label>
            <select
              value={targetCollectionId}
              onChange={(e) => setTargetCollectionId(e.target.value)}
              className={styles.fieldSelect}
            >
              <option value="">Apenas Catálogo Público Geral</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.slug})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Jogo Padrão</label>
            <input
              type="text"
              placeholder="Ex: Halo Infinite, Forza Horizon 5"
              value={globalGame}
              onChange={(e) => setGlobalGame(e.target.value)}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Tags Compartilhadas (separadas por vírgula)</label>
            <input
              type="text"
              placeholder="Ex: 4k, oled, paisagem, hdr"
              value={globalTags}
              onChange={(e) => setGlobalTags(e.target.value)}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Prefixo de Título</label>
            <div className={styles.fieldRowWithAction}>
              <input
                type="text"
                placeholder="Ex: Master Chief"
                value={titlePrefix}
                onChange={(e) => setTitlePrefix(e.target.value)}
                className={styles.fieldInput}
              />
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleApplyPrefix}
                disabled={!titlePrefix.trim() || batchFiles.length === 0}
              >
                Aplicar
              </button>
            </div>
          </div>

          {batchFiles.length > 0 && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleStartBatchUpload}
              disabled={uploadingBatch}
            >
              <UploadCloud size={16} />
              <span>
                {uploadingBatch
                  ? 'Enviando...'
                  : `Publicar ${batchFiles.length} Wallpaper${batchFiles.length > 1 ? 's' : ''}`}
              </span>
            </button>
          )}

          {uploadingBatch && (
            <div className={styles.progressBarContainer}>
              <progress
                className={styles.progressBarFill}
                value={batchProgress.completed}
                max={batchProgress.total || 1}
              />
              <div className={styles.progressStatusText}>
                <span>{batchProgress.current}</span>
                <span>
                  {batchProgress.completed} / {batchProgress.total}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.batchFilesSection}>
          <div
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) {
                handleFilesSelected(e.dataTransfer.files);
              }
            }}
          >
            <div className={styles.dropzoneIconWrapper}>
              <UploadCloud size={32} className={styles.dropzoneIcon} />
            </div>
            <p className={styles.dropzoneTitle}>
              Arraste imagens ou clique para selecionar
            </p>
            <p className={styles.dropzoneHint}>
              Formatos recomendados: 16:9 em WebP, PNG ou JPG (até 20MB cada).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleFilesSelected(e.target.files);
                }
              }}
              hidden
            />
          </div>

          {batchFiles.length > 0 && (
            <div className={styles.batchQueueCard}>
              <div className={styles.batchFilesHeader}>
                <div className={styles.batchQueueTitle}>
                  <FileImage size={16} />
                  <span>Fila de Envio ({batchFiles.length} {batchFiles.length === 1 ? 'imagem' : 'imagens'})</span>
                </div>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setBatchFiles([])}
                  disabled={uploadingBatch}
                >
                  Limpar fila
                </button>
              </div>

              <div className={styles.batchFilesList}>
                {batchFiles.map((item) => (
                  <div key={item.id} className={styles.batchFileItem}>
                    <img
                      src={item.previewUrl}
                      alt=""
                      className={styles.batchThumb}
                    />
                    <div className={styles.batchItemContent}>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchFiles((prev) =>
                            prev.map((f) => (f.id === item.id ? { ...f, title: val } : f))
                          );
                        }}
                        className={styles.batchTitleInput}
                        disabled={uploadingBatch}
                        placeholder="Título do wallpaper"
                      />
                    </div>

                    <div className={styles.batchItemStatusCol}>
                      {item.status === 'uploading' && (
                        <span className={`${styles.batchItemStatus} ${styles.statusUploading}`}>
                          Enviando...
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className={`${styles.batchItemStatus} ${styles.statusSuccess}`}>
                          <Check size={12} /> Enviado
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className={`${styles.batchItemStatus} ${styles.statusError}`} title={item.error || 'Erro'}>
                          <AlertCircle size={12} /> Erro
                        </span>
                      )}

                      {!uploadingBatch && (
                        <button
                          type="button"
                          className={styles.btnDangerIconSmall}
                          onClick={() => handleRemoveFile(item.id)}
                          aria-label="Remover imagem da fila"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
