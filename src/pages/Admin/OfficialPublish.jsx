import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../services/api';
import { auth } from '../../services/firebase';
import {
  UploadCloud,
  Layers,
  X,
  Check,
  AlertCircle,
  FileImage,
  Tag,
  Type,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import AdminHeader from './components/AdminHeader';
import {
  saveQueueItemDb,
  saveAllQueueItemsDb,
  deleteQueueItemDb,
  clearQueueDb,
  saveQueueMetaDb,
  loadQueueFromDb,
} from '../../utils/uploadQueueDb';
import { optimizeImageForUpload } from '../../utils/imageOptimizer';
import { suggestTags, detectGameFromText } from '../../utils/tagSuggester';
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
  const [batchProgress, setBatchProgress] = useState({ total: 0, completed: 0, failed: 0, current: '' });
  const [dragging, setDragging] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);
  const [interruptedNotice, setInterruptedNotice] = useState(false);

  const fileInputRef = useRef(null);
  const batchFilesRef = useRef(batchFiles);

  useEffect(() => {
    batchFilesRef.current = batchFiles;
  }, [batchFiles]);

  useEffect(() => {
    return () => {
      batchFilesRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (uploadingBatch) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploadingBatch]);

  useEffect(() => {
    api.collections.list().then((res) => {
      setCollections(res || []);
    }).catch(() => {});

    loadQueueFromDb().then(({ items, meta }) => {
      if (items && items.length > 0) {
        const restored = items.map((item) => ({
          ...item,
          previewUrl: URL.createObjectURL(item.file),
          status: item.status === 'uploading' ? 'idle' : item.status,
        }));
        setBatchFiles(restored);
        if (meta.targetCollectionId) setTargetCollectionId(meta.targetCollectionId);
        if (meta.globalGame) setGlobalGame(meta.globalGame);
        if (meta.globalTags) setGlobalTags(meta.globalTags);
        if (meta.titlePrefix) setTitlePrefix(meta.titlePrefix);

        const hasPending = restored.some((f) => f.status !== 'success');
        if (hasPending) {
          setInterruptedNotice(true);
        }
      }
    }).catch(() => {});
  }, []);

  const handleFilesSelected = (filesList) => {
    setCompletedSummary(null);
    setInterruptedNotice(false);
    const valid = Array.from(filesList).filter((f) =>
      f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp)$/i)
    );

    const mapped = valid.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      extension: file.name.split('.').pop()?.toUpperCase() || 'IMG',
      previewUrl: URL.createObjectURL(file),
      title: cleanFileNameToTitle(file.name),
      status: 'idle',
      error: null,
    }));

    if (!globalGame && valid.length > 0) {
      const detected = detectGameFromText(valid[0].name);
      if (detected) {
        setGlobalGame(detected);
        saveQueueMetaDb('globalGame', detected);
      }
    }

    setBatchFiles((prev) => {
      const updated = [...prev, ...mapped];
      saveAllQueueItemsDb(updated);
      return updated;
    });
  };

  const handleRemoveFile = (id) => {
    deleteQueueItemDb(id);
    setBatchFiles((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    clearQueueDb();
    batchFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setBatchFiles([]);
    setCompletedSummary(null);
    setInterruptedNotice(false);
  };

  const handleTitleChange = (id, newTitle) => {
    setBatchFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const updated = { ...f, title: newTitle };
          saveQueueItemDb(updated);
          return updated;
        }
        return f;
      })
    );
  };

  const handleApplyPrefix = () => {
    if (!titlePrefix.trim()) return;
    const cleanPrefix = titlePrefix.trim();
    setBatchFiles((prev) => {
      const updated = prev.map((item) => {
        if (item.title.startsWith(cleanPrefix)) return item;
        return {
          ...item,
          title: `${cleanPrefix} - ${item.title}`,
        };
      });
      saveAllQueueItemsDb(updated);
      return updated;
    });
    saveQueueMetaDb('titlePrefix', cleanPrefix);
  };

  const currentGlobalTagsList = useMemo(() => {
    return globalTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }, [globalTags]);

  const dynamicSuggestedTags = useMemo(() => {
    const titlesSample = batchFiles.slice(0, 15).map((f) => f.title).join(' ');
    const namesSample = batchFiles.slice(0, 15).map((f) => f.file?.name || '').join(' ');
    return suggestTags({
      title: `${titlePrefix} ${titlesSample}`,
      fileName: namesSample,
      game: globalGame,
      existingTags: currentGlobalTagsList,
      limit: 10,
    });
  }, [batchFiles, titlePrefix, globalGame, currentGlobalTagsList]);

  const handleAddSuggestedTag = (tag) => {
    if (!currentGlobalTagsList.includes(tag.toLowerCase())) {
      const updated = [...currentGlobalTagsList, tag.toLowerCase()].join(', ');
      setGlobalTags(updated);
      saveQueueMetaDb('globalTags', updated);
    }
  };

  const handleAddAllSuggestedTags = () => {
    const combined = Array.from(
      new Set([...currentGlobalTagsList, ...dynamicSuggestedTags.map((t) => t.toLowerCase())])
    ).join(', ');
    setGlobalTags(combined);
    saveQueueMetaDb('globalTags', combined);
  };

  const handleCollectionChange = (val) => {
    setTargetCollectionId(val);
    saveQueueMetaDb('targetCollectionId', val);
  };

  const handleGameChange = (val) => {
    setGlobalGame(val);
    saveQueueMetaDb('globalGame', val);
  };

  const handleTagsChange = (val) => {
    setGlobalTags(val);
    saveQueueMetaDb('globalTags', val);
  };

  const handlePrefixChange = (val) => {
    setTitlePrefix(val);
    saveQueueMetaDb('titlePrefix', val);
  };

  const handleStartBatchUpload = async () => {
    if (batchFiles.length === 0 || uploadingBatch) return;

    setUploadingBatch(true);
    setCompletedSummary(null);
    setInterruptedNotice(false);
    setBatchProgress({ total: batchFiles.length, completed: 0, failed: 0, current: 'Iniciando upload...' });

    const tagsArray = globalTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const queue = [...batchFiles];
    let completedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'success') {
        completedCount++;
        continue;
      }

      setBatchProgress({
        total: queue.length,
        completed: completedCount,
        failed: failedCount,
        current: `Enviando (${i + 1}/${queue.length}): ${item.title}...`,
      });

      setBatchFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
      );
      saveQueueItemDb({ ...item, status: 'uploading' });

      try {
        let fileToSend = item.file;
        if (fileToSend.size > 3.5 * 1024 * 1024) {
          setBatchProgress({
            total: queue.length,
            completed: completedCount,
            failed: failedCount,
            current: `Otimizando (${i + 1}/${queue.length}): ${item.title}...`,
          });
          fileToSend = await optimizeImageForUpload(fileToSend);
        }

        const user = auth.currentUser;
        if (!user) throw new Error('Não autenticado');
        const token = await user.getIdToken();

        const formData = new FormData();
        formData.append('image', fileToSend);
        formData.append('title', item.title || 'Sem título');
        if (globalGame.trim()) formData.append('game', globalGame.trim());
        if (targetCollectionId) formData.append('collectionId', targetCollectionId);
        if (tagsArray.length > 0) formData.append('tags', JSON.stringify(tagsArray));
        formData.append('isPublic', 'true');
        formData.append('publishAsAdmin', 'true');

        let res;
        try {
          res = await fetch(`${API_URL}/api/wallpapers/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
        } catch (netErr) {
          if (netErr.message === 'Failed to fetch') {
            throw new Error('Falha de conexão com a API ou tamanho da requisição excedido', { cause: netErr });
          }
          throw netErr;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        completedCount++;
        setBatchFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'success' } : f))
        );
        saveQueueItemDb({ ...item, status: 'success' });
      } catch (err) {
        failedCount++;
        const message = err.message === 'Failed to fetch'
          ? 'Falha de conexão com a API'
          : err.message;
        setBatchFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error', error: message } : f
          )
        );
        saveQueueItemDb({ ...item, status: 'error', error: message });
      }
    }

    setBatchProgress({
      total: queue.length,
      completed: completedCount,
      failed: failedCount,
      current: `Processo finalizado. ${completedCount} enviados com sucesso.`,
    });
    setUploadingBatch(false);
    setCompletedSummary({
      total: queue.length,
      completed: completedCount,
      failed: failedCount,
    });
    if (onPublishComplete) onPublishComplete();
  };

  const totalSizeMB = batchFiles
    .reduce((acc, f) => acc + (f.file.size / (1024 * 1024)), 0)
    .toFixed(1);

  const pendingCount = batchFiles.filter((f) => f.status !== 'success').length;

  return (
    <div className={styles.viewContainer}>
      <AdminHeader
        title="Upload em Lote"
        subtitle="Envie pacotes de papéis de parede com aplicação unificada de metadados, títulos e coleções oficiais."
        badge={
          <span className={styles.liveIndicator}>
            <span>{batchFiles.length} {batchFiles.length === 1 ? 'arquivo' : 'arquivos'} na fila</span>
          </span>
        }
      />

      {interruptedNotice && pendingCount > 0 && (
        <div className={styles.batchResumeBanner} role="status">
          <div className={styles.batchResumeLeft}>
            <RotateCcw size={18} className={styles.batchResumeIcon} />
            <div>
              <h4 className={styles.batchResumeTitle}>Fila persistente restaurada</h4>
              <p className={styles.batchResumeSub}>
                {batchFiles.length - pendingCount} já enviados, {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}. Os arquivos foram preservados e você pode continuar o envio sem perda de dados.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.btnSecondarySmall}
            onClick={() => setInterruptedNotice(false)}
          >
            Dispensar aviso
          </button>
        </div>
      )}

      {completedSummary && (
        <div className={styles.batchSuccessBanner} role="status">
          <div className={styles.batchSuccessLeft}>
            <CheckCircle2 size={20} className={styles.batchSuccessIcon} />
            <div>
              <h4 className={styles.batchSuccessTitle}>Envio em lote concluído com sucesso</h4>
              <p className={styles.batchSuccessSub}>
                {completedSummary.completed} de {completedSummary.total} papéis de parede foram adicionados ao catálogo.
                {completedSummary.failed > 0 && ` (${completedSummary.failed} falharam).`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.btnSecondarySmall}
            onClick={() => setCompletedSummary(null)}
          >
            Fechar aviso
          </button>
        </div>
      )}

      <div className={styles.publishGrid}>
        <div className={styles.publishConfigCard}>
          <div className={styles.configCardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Layers size={18} />
            </div>
            <div>
              <h3 className={styles.configCardTitle}>Configurações do Lote</h3>
              <p className={styles.configCardSub}>Metadados aplicados em massa</p>
            </div>
          </div>

          <div className={styles.configSection}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="batch-collection">
                Coleção de Destino
              </label>
              <select
                id="batch-collection"
                value={targetCollectionId}
                onChange={(e) => handleCollectionChange(e.target.value)}
                className={styles.fieldSelect}
              >
                <option value="">Apenas Catálogo Geral Público</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.slug})
                  </option>
                ))}
              </select>
              <span className={styles.fieldHelp}>
                Coleção oficial onde as imagens serão agrupadas no catálogo
              </span>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="batch-game">
                Jogo ou Franquia Padrão
              </label>
              <input
                id="batch-game"
                type="text"
                placeholder="Ex: Halo Infinite, Forza Horizon 5"
                value={globalGame}
                onChange={(e) => handleGameChange(e.target.value)}
                className={styles.fieldInput}
              />
              <span className={styles.fieldHelp}>
                Nome do jogo associado a todos os itens deste lote
              </span>
            </div>
          </div>

          <div className={styles.configDivider} />

          <div className={styles.configSection}>
            <div className={styles.formField}>
              <div className={styles.fieldLabelWithIcon}>
                <Tag size={14} />
                <label className={styles.fieldLabel} htmlFor="batch-tags">
                  Tags Compartilhadas
                </label>
              </div>
              <input
                id="batch-tags"
                type="text"
                placeholder="Ex: 4k, oled, paisagem, hdr"
                value={globalTags}
                onChange={(e) => handleTagsChange(e.target.value)}
                className={styles.fieldInput}
              />
              <div className={styles.suggestedTagsRow}>
                <span className={styles.suggestedPrompt}>Sugeridas dinâmicas:</span>
                {dynamicSuggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.suggestedTagBtn}
                    onClick={() => handleAddSuggestedTag(tag)}
                  >
                    +{tag}
                  </button>
                ))}
                {dynamicSuggestedTags.length > 1 && (
                  <button
                    type="button"
                    className={styles.suggestedTagBtnAll}
                    onClick={handleAddAllSuggestedTags}
                    title="Adicionar todas as tags sugeridas"
                  >
                    + Adicionar todas
                  </button>
                )}
              </div>
            </div>

            <div className={styles.formField}>
              <div className={styles.fieldLabelWithIcon}>
                <Type size={14} />
                <label className={styles.fieldLabel} htmlFor="batch-prefix">
                  Prefixo nos Títulos
                </label>
              </div>
              <div className={styles.fieldRowWithAction}>
                <input
                  id="batch-prefix"
                  type="text"
                  placeholder="Ex: Forza Horizon"
                  value={titlePrefix}
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  className={styles.fieldInput}
                />
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleApplyPrefix}
                  disabled={!titlePrefix.trim() || batchFiles.length === 0 || uploadingBatch}
                >
                  Aplicar
                </button>
              </div>
              <span className={styles.fieldHelp}>
                Adiciona o prefixo no início do título de todos os itens da fila
              </span>
            </div>
          </div>

          <div className={styles.batchSummaryCard}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total de Arquivos:</span>
              <span className={styles.summaryValue}>{batchFiles.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tamanho Estimado:</span>
              <span className={styles.summaryValue}>{totalSizeMB} MB</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Coleção Alvo:</span>
              <span className={styles.summaryValue}>
                {collections.find((c) => c.id === targetCollectionId)?.name || 'Catálogo Geral'}
              </span>
            </div>

            {batchFiles.length > 0 && (
              <button
                type="button"
                className={styles.btnBatchSubmit}
                onClick={handleStartBatchUpload}
                disabled={uploadingBatch || pendingCount === 0}
              >
                <UploadCloud size={16} />
                <span>
                  {uploadingBatch
                    ? 'Processando Envio...'
                    : pendingCount < batchFiles.length && pendingCount > 0
                    ? `Continuar Envio (${pendingCount} restantes)`
                    : `Publicar ${pendingCount} ${pendingCount === 1 ? 'Wallpaper' : 'Wallpapers'}`}
                </span>
              </button>
            )}
          </div>

          {uploadingBatch && (
            <div className={styles.progressBarContainer}>
              <progress
                className={styles.progressBarFill}
                value={batchProgress.completed + batchProgress.failed}
                max={batchProgress.total || 1}
              />
              <div className={styles.progressStatusText}>
                <span>{batchProgress.current}</span>
                <span>
                  {batchProgress.completed + batchProgress.failed} / {batchProgress.total}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.batchFilesSection}>
          <div
            className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) {
                handleFilesSelected(e.dataTransfer.files);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <div className={styles.dropzoneIconWrapper}>
              <UploadCloud size={32} className={styles.dropzoneIcon} />
            </div>
            <p className={styles.dropzoneTitle}>
              Arraste múltiplos papéis de parede ou clique para selecionar
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
              tabIndex={-1}
            />
          </div>

          {batchFiles.length > 0 && (
            <div className={styles.batchQueueCard}>
              <div className={styles.batchFilesHeader}>
                <div className={styles.batchQueueTitle}>
                  <FileImage size={16} />
                  <span>Fila de Envio ({batchFiles.length} {batchFiles.length === 1 ? 'imagem' : 'imagens'} · {totalSizeMB} MB)</span>
                </div>
                <div className={styles.queueActions}>
                  <button
                    type="button"
                    className={styles.btnSecondarySmall}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingBatch}
                  >
                    <Plus size={13} />
                    <span>Adicionar mais</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnDangerSmall}
                    onClick={handleClearAll}
                    disabled={uploadingBatch}
                  >
                    <Trash2 size={13} />
                    <span>Limpar fila</span>
                  </button>
                </div>
              </div>

              <div className={styles.batchFilesList}>
                {batchFiles.map((item) => (
                  <div key={item.id} className={styles.batchFileItem}>
                    <div className={styles.batchThumbWrapper}>
                      <img
                        src={item.previewUrl}
                        alt=""
                        className={styles.batchThumb}
                      />
                    </div>
                    <div className={styles.batchItemContent}>
                      <div className={styles.batchItemTop}>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleTitleChange(item.id, e.target.value)}
                          className={styles.batchTitleInput}
                          disabled={uploadingBatch}
                          placeholder="Título do wallpaper"
                        />
                      </div>
                      <div className={styles.batchItemMeta}>
                        <span className={styles.batchFileExt}>{item.extension}</span>
                        <span className={styles.batchFileSize}>{item.sizeFormatted}</span>
                      </div>
                    </div>

                    <div className={styles.batchItemStatusCol}>
                      {item.status === 'idle' && (
                        <span className={styles.statusIdle}>Pronto</span>
                      )}
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
                        <span
                          className={`${styles.batchItemStatus} ${styles.statusError}`}
                          title={item.error || 'Erro'}
                        >
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
