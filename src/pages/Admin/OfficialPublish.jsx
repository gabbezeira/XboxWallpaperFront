import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { auth } from '../../services/firebase';
import {
  UploadCloud,
  Image as ImageIcon,
  Layers,
  X,
  Check,
  AlertCircle,
  Plus,
  Trash2,
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
  const [subTab, setSubTab] = useState('batch');
  const [collections, setCollections] = useState([]);

  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', targetTag: '', file: null });
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroMessage, setHeroMessage] = useState(null);

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

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    if (!heroForm.file) return;
    setHeroLoading(true);
    setHeroMessage(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Não autenticado');
      const token = await user.getIdToken(true);

      const formData = new FormData();
      formData.append('image', heroForm.file);
      formData.append('title', heroForm.title);
      formData.append('subtitle', heroForm.subtitle);
      formData.append('targetTag', heroForm.targetTag);

      const res = await fetch(`${API_URL}/api/hero-slides/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setHeroForm({ title: '', subtitle: '', targetTag: '', file: null });
      setHeroMessage({ type: 'success', text: 'Hero Slide publicado com sucesso!' });
      if (onPublishComplete) onPublishComplete();
    } catch (err) {
      setHeroMessage({ type: 'error', text: err.message });
    } finally {
      setHeroLoading(false);
    }
  };

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

    const processItem = async (item) => {
      try {
        setBatchProgress((prev) => ({
          ...prev,
          current: `Enviando: ${item.title}`,
        }));

        setBatchFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
        );

        await api.wallpapers.upload(item.file, {
          title: item.title || null,
          game: globalGame.trim() || null,
          tags: tagsArray,
          isPublic: true,
          collectionId: targetCollectionId || null,
        });

        completedCount += 1;
        setBatchProgress({
          total: batchFiles.length,
          completed: completedCount,
          current: `${completedCount} de ${batchFiles.length} concluídos`,
        });

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
    };

    const CONCURRENCY = 2;
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      const chunk = queue.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map((item) => processItem(item)));
    }

    setUploadingBatch(false);
    if (onPublishComplete) onPublishComplete();
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Publicação & Gestão de Mídia</h2>
          <p className={styles.sectionSubtitle}>
            Envio em lote para coleções oficiais ou novos destaques no Hero Carousel da Home.
          </p>
        </div>

        <div className={styles.subSegment}>
          <button
            type="button"
            className={`${styles.subSegmentBtn} ${subTab === 'batch' ? styles.subSegmentActive : ''}`}
            onClick={() => setSubTab('batch')}
          >
            <UploadCloud size={14} />
            <span>Upload em Lote</span>
          </button>
          <button
            type="button"
            className={`${styles.subSegmentBtn} ${subTab === 'hero' ? styles.subSegmentActive : ''}`}
            onClick={() => setSubTab('hero')}
          >
            <ImageIcon size={14} />
            <span>Hero Slide</span>
          </button>
        </div>
      </div>

      {subTab === 'batch' && (
        <div className={styles.publishGrid}>
          <div className={styles.publishConfigCard}>
            <h3 className={styles.configCardTitle}>
              <Layers size={16} />
              <span>Configurações do Lote</span>
            </h3>

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
              <label className={styles.fieldLabel}>Jogo padrão</label>
              <input
                type="text"
                placeholder="Ex: Halo Infinite, Forza"
                value={globalGame}
                onChange={(e) => setGlobalGame(e.target.value)}
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Tags (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: 4k, oled, minimalista"
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
                  placeholder="Ex: Spartan Series"
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
              <UploadCloud size={32} className={styles.dropzoneIcon} />
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
              <div className={styles.batchFilesSection}>
                <div className={styles.batchFilesHeader}>
                  <span>Fila de envio ({batchFiles.length} imagens)</span>
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
                      />

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
                        <span className={`${styles.batchItemStatus} ${styles.statusError}`}>
                          <AlertCircle size={12} /> Erro
                        </span>
                      )}

                      {!uploadingBatch && (
                        <button
                          type="button"
                          className={styles.btnDangerIconSmall}
                          onClick={() => handleRemoveFile(item.id)}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'hero' && (
        <form onSubmit={handleHeroSubmit} className={styles.publishConfigCard}>
          <h3 className={styles.configCardTitle}>
            <ImageIcon size={16} />
            <span>Publicar Novo Hero Slide (Destaque)</span>
          </h3>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Título principal</label>
            <input
              type="text"
              placeholder="Ex: Halo Infinite: Season 6"
              value={heroForm.title}
              onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Subtítulo / Descrição curta</label>
            <input
              type="text"
              placeholder="Ex: Novos wallpapers em 4K para seu console"
              value={heroForm.subtitle}
              onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
              className={styles.fieldInput}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Tag de destino ao clicar</label>
            <input
              type="text"
              placeholder="Ex: halo (redireciona para /collection/halo)"
              value={heroForm.targetTag}
              onChange={(e) => setHeroForm({ ...heroForm, targetTag: e.target.value })}
              className={styles.fieldInput}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel}>Imagem Widescreen (16:9)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroForm({ ...heroForm, file: e.target.files[0] })}
              className={styles.fieldInput}
              required
            />
          </div>

          {heroMessage && (
            <div className={styles.batchActionText}>
              <span>{heroMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={heroLoading || !heroForm.file}
          >
            {heroLoading ? 'Enviando Hero Slide...' : 'Publicar Hero Slide'}
          </button>
        </form>
      )}
    </div>
  );
}
