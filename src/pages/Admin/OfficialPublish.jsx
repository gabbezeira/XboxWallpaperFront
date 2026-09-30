import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { auth } from '../../services/firebase';
import { UploadCloud, Image as ImageIcon, Layers, X, Check, AlertCircle, RefreshCw, Plus } from 'lucide-react';
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
  const [batchResults, setBatchResults] = useState(null);

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
        title: item.title.startsWith(titlePrefix) ? item.title : `${titlePrefix.trim()} - ${item.title}`,
      }))
    );
  };

  const handleStartBatchUpload = async () => {
    if (batchFiles.length === 0 || uploadingBatch) return;

    setUploadingBatch(true);
    setBatchResults(null);
    setBatchProgress({ total: batchFiles.length, completed: 0, current: 'Iniciando...' });

    const tagsArray = globalTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const queue = [...batchFiles];
    let completedCount = 0;
    let failedCount = 0;

    const processItem = async (item) => {
      try {
        setBatchProgress((prev) => ({
          ...prev,
          current: `Enviando: ${item.title}`,
        }));

        await api.wallpapers.upload(item.file, {
          title: item.title || null,
          game: globalGame || null,
          tags: tagsArray,
          isPublic: true,
          collectionId: targetCollectionId || null,
        });

        item.status = 'success';
        completedCount++;
      } catch (err) {
        item.status = 'error';
        item.error = err.message;
        failedCount++;
      } finally {
        setBatchProgress((prev) => ({
          ...prev,
          completed: completedCount + failedCount,
        }));
      }
    };

    const CONCURRENCY = 2;
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      const slice = queue.slice(i, i + CONCURRENCY);
      await Promise.all(slice.map((item) => processItem(item)));
      setBatchFiles([...batchFiles]);
    }

    setUploadingBatch(false);
    setBatchResults({
      success: completedCount,
      failed: failedCount,
    });

    if (failedCount === 0) {
      setTimeout(() => {
        batchFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
        setBatchFiles([]);
      }, 2000);
    }

    if (onPublishComplete) onPublishComplete();
  };

  return (
    <div className={styles.publishContainer}>
      <div className={styles.subTabs}>
        <button
          type="button"
          className={`${styles.btnSubTab} ${subTab === 'batch' ? styles.btnSubTabActive : ''}`}
          onClick={() => setSubTab('batch')}
        >
          <UploadCloud size={16} />
          <span>Upload em Lote para Coleção</span>
        </button>
        <button
          type="button"
          className={`${styles.btnSubTab} ${subTab === 'hero' ? styles.btnSubTabActive : ''}`}
          onClick={() => setSubTab('hero')}
        >
          <ImageIcon size={16} />
          <span>Novo Hero Slide</span>
        </button>
      </div>

      {subTab === 'batch' && (
        <div className={styles.batchSection}>
          <div className={styles.batchConfigCard}>
            <h3 className={styles.configTitle}>Configurações Compartilhadas do Lote</h3>
            <p className={styles.configSubtitle}>
              Todos os wallpapers selecionados receberão estas propriedades automaticamente.
            </p>

            <div className={styles.configGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Coleção de Destino</label>
                <select
                  className={styles.selectInput}
                  value={targetCollectionId}
                  onChange={(e) => setTargetCollectionId(e.target.value)}
                >
                  <option value="">Nenhuma (Catálogo Geral)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Jogo</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  placeholder="Ex: Grand Theft Auto VI"
                  value={globalGame}
                  onChange={(e) => setGlobalGame(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Tags Globais (separadas por vírgula)</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  placeholder="Ex: gta, gta6, vice city, 4k"
                  value={globalTags}
                  onChange={(e) => setGlobalTags(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Prefixo de Título (Opcional)</label>
                <div className={styles.prefixRow}>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    placeholder="Ex: GTA VI"
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.btnSecondarySmall}
                    onClick={handleApplyPrefix}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={40} className={styles.dropIcon} />
            <h4 className={styles.dropTitle}>Arraste múltiplos arquivos ou clique para selecionar</h4>
            <p className={styles.dropDesc}>Suporta JPG, PNG ou WebP em alta resolução (4K)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className={styles.hiddenInput}
              onChange={(e) => {
                if (e.target.files) handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {batchFiles.length > 0 && (
            <div className={styles.batchReviewCard}>
              <div className={styles.batchReviewHeader}>
                <h4 className={styles.reviewTitle}>
                  {batchFiles.length} {batchFiles.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                </h4>
                <div className={styles.batchActions}>
                  <button
                    type="button"
                    className={styles.btnGhostSmall}
                    disabled={uploadingBatch}
                    onClick={() => {
                      batchFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
                      setBatchFiles([]);
                    }}
                  >
                    Limpar Todos
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    disabled={uploadingBatch}
                    onClick={handleStartBatchUpload}
                  >
                    {uploadingBatch ? 'Enviando Lote...' : `Publicar ${batchFiles.length} Wallpapers`}
                  </button>
                </div>
              </div>

              {uploadingBatch && (
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressInfo}>
                    <span>{batchProgress.current}</span>
                    <span>{batchProgress.completed} de {batchProgress.total}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      data-progress={Math.round((batchProgress.completed / batchProgress.total) * 100)}
                    />
                  </div>
                </div>
              )}

              {batchResults && (
                <div className={styles.resultsBanner}>
                  <Check size={16} />
                  <span>
                    Concluído: {batchResults.success} publicados com sucesso
                    {batchResults.failed > 0 && `, ${batchResults.failed} falharam`}.
                  </span>
                </div>
              )}

              <div className={styles.filesList}>
                {batchFiles.map((item) => (
                  <div key={item.id} className={styles.fileItem}>
                    <img src={item.previewUrl} alt="" className={styles.fileThumb} />
                    <div className={styles.fileDetails}>
                      <input
                        type="text"
                        className={styles.fileTitleInput}
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchFiles((prev) =>
                            prev.map((f) => (f.id === item.id ? { ...f, title: val } : f))
                          );
                        }}
                      />
                      <span className={styles.fileName}>{item.file.name}</span>
                    </div>

                    <div className={styles.fileStatusCol}>
                      {item.status === 'success' && <Check size={18} className={styles.iconSuccess} />}
                      {item.status === 'error' && (
                        <span className={styles.iconError} title={item.error}>
                          <AlertCircle size={18} />
                        </span>
                      )}
                      {!uploadingBatch && (
                        <button
                          type="button"
                          className={styles.btnRemoveItem}
                          onClick={() => handleRemoveFile(item.id)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'hero' && (
        <div className={styles.heroSection}>
          <form onSubmit={handleHeroSubmit} className={styles.heroFormCard}>
            <h3 className={styles.configTitle}>Novo Destaque do Carrossel (Hero)</h3>
            <p className={styles.configSubtitle}>
              Banner principal em tela cheia na página inicial da aplicação.
            </p>

            <div
              className={`${styles.dropZoneHero} ${heroForm.file ? styles.dropZoneHeroReady : ''}`}
              onClick={() => document.getElementById('heroInputFile')?.click()}
            >
              <UploadCloud size={36} className={styles.dropIcon} />
              <p className={styles.dropTitle}>
                {heroForm.file ? heroForm.file.name : 'Selecionar Imagem do Hero (Recomendado 1920×1080 ou 4K)'}
              </p>
              <input
                id="heroInputFile"
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setHeroForm((prev) => ({ ...prev, file }));
                }}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Título do Slide (Enter para quebrar linha)</label>
              <textarea
                className={styles.textareaInput}
                placeholder="Ex: O Retorno de Master Chief"
                value={heroForm.title}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Subtítulo</label>
              <textarea
                className={styles.textareaInput}
                placeholder="Ex: Explore a nova campanha épica em 4K UHD"
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Tag de Destino (Coleção/Filtro)</label>
              <input
                type="text"
                className={styles.fieldInput}
                placeholder="Ex: halo ou forza"
                value={heroForm.targetTag}
                onChange={(e) => setHeroForm((prev) => ({ ...prev, targetTag: e.target.value }))}
              />
            </div>

            {heroMessage && (
              <div className={heroMessage.type === 'success' ? styles.successBox : styles.errorBox}>
                {heroMessage.text}
              </div>
            )}

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={heroLoading || !heroForm.file}
            >
              {heroLoading ? 'Publicando...' : 'Cadastrar Hero Slide'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
