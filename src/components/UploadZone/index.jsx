import {
  AlertCircle,
  Ban,
  Check,
  Globe,
  Image as ImageIcon,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  UploadCloud,
  X,
} from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUpload } from '../../hooks/useUpload';
import { suggestTags, detectGameFromText } from '../../utils/tagSuggester';
import styles from './styles.module.scss';

export default function UploadZone({ onUploadComplete }) {
  const { upload, uploading, progress, error } = useUpload();
  const { profile, needsEmailVerification, user } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageDims, setImageDims] = useState(null);
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [addToCollection, setAddToCollection] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const CUTOFF_TS = Date.parse('2026-10-04T12:00:00Z');
  const GRACE_END_TS = Date.parse('2026-10-18T23:59:59Z');
  const userCreationTs = user?.metadata?.creationTime
    ? Date.parse(user.metadata.creationTime)
    : Date.now();
  const isExistingAccountInGrace =
    userCreationTs <= CUTOFF_TS && Date.now() < GRACE_END_TS;

  const mustBlockVerification =
    needsEmailVerification && !isExistingAccountInGrace;

  const userMaxImages = profile?.maxImages || 8;
  const isQuotaFull = profile && (profile.imageCount || 0) >= userMaxImages;
  const isUploadDisabled = Boolean(isQuotaFull || mustBlockVerification);

  const handleSelectFile = (file) => {
    setLocalError(null);

    if (mustBlockVerification) {
      setLocalError('Confirme seu email para poder enviar wallpapers');
      return;
    }

    const isImage =
      file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    if (!isImage) {
      setLocalError('Apenas imagens válidas (JPG, PNG, WebP) são permitidas');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setLocalError('Imagem muito grande (limite de 20 MB)');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setImageDims(null);
    setPreviewUrl(URL.createObjectURL(file));
    if (!title) {
      const derived = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_.]+/g, ' ')
        .trim();
      setTitle(derived);
      const detected = detectGameFromText(derived);
      if (detected && !game) {
        setGame(detected);
      }
    }
  };

  const handleImageLoaded = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setImageDims({ width: naturalWidth, height: naturalHeight });
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    if (!title.trim()) {
      setLocalError('Informe um título para o wallpaper');
      return;
    }

    try {
      await upload(selectedFile, {
        title: title.trim(),
        game: game.trim() || null,
        tags,
        isPublic,
        collectionId:
          addToCollection && profile?.assignedCollectionId ? profile.assignedCollectionId : null,
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageDims(null);
      setTitle('');
      setGame('');
      setTags([]);
      setIsPublic(false);
      setAddToCollection(false);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDims(null);
    setTitle('');
    setGame('');
    setTags([]);
    setIsPublic(false);
    setAddToCollection(false);
    setLocalError(null);
  };

  const addTag = (tag) => {
    const cleaned = tag.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '');
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const dynamicSuggestedTags = useMemo(() => {
    return suggestTags({
      title,
      fileName: selectedFile?.name || '',
      game,
      existingTags: tags,
      limit: 6,
    });
  }, [title, selectedFile?.name, game, tags]);

  const handleAddAllSuggestions = () => {
    const slots = 5 - tags.length;
    if (slots <= 0) return;
    const toAdd = dynamicSuggestedTags.slice(0, slots);
    setTags((prev) => [...prev, ...toAdd]);
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleSelectFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSelectFile(file);
    }
  };

  const trimmedTag = tagInput.trim();
  const canCreateTag = trimmedTag.length > 0 && !tags.includes(trimmedTag.toLowerCase()) && tags.length < 5;

  const getResolutionBadge = () => {
    if (!imageDims) return null;
    const { width } = imageDims;
    if (width >= 3840) return '4K UHD';
    if (width >= 2560) return '1440p QHD';
    if (width >= 1920) return '1080p FHD';
    return 'HD';
  };

  const isAspectRatio169 = () => {
    if (!imageDims) return false;
    const ratio = imageDims.width / imageDims.height;
    return Math.abs(ratio - 16 / 9) < 0.05;
  };

  if (uploading) {
    return (
      <div className={styles.zone}>
        <div className={styles.uploading}>
          <div className={styles.spinner} />
          <span className={styles.progressText}>{progress || 'Enviando imagem...'}</span>
          <span className={styles.subtitle}>Processando e otimizando no Firebase Storage</span>
        </div>
      </div>
    );
  }

  if (selectedFile && previewUrl) {
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const fileExtension = selectedFile.name.split('.').pop()?.toUpperCase() || 'IMG';

    return (
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <div className={styles.formHeaderLeft}>
            <ImageIcon size={18} className={styles.formHeaderIcon} />
            <div>
              <h3 className={styles.formTitle}>Detalhes do Wallpaper</h3>
              <p className={styles.formSubtitle}>Preencha as informações para organizar e categorizar o papel de parede</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.btnSecondarySmall}
            onClick={() => inputRef.current?.click()}
          >
            <RefreshCw size={13} />
            <span>Trocar arquivo</span>
          </button>
        </div>

        <div className={styles.previewRow}>
          <div className={styles.previewCol}>
            <div className={styles.previewWrapper}>
              <img
                src={previewUrl}
                alt="Prévia do Wallpaper"
                className={styles.preview}
                onLoad={handleImageLoaded}
              />
            </div>

            <div className={styles.previewSpecs}>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Resolução</span>
                <span className={styles.specValue}>
                  {imageDims ? `${imageDims.width} × ${imageDims.height}` : 'Calculando...'}
                </span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Tamanho</span>
                <span className={styles.specValue}>{fileSizeMB} MB ({fileExtension})</span>
              </div>
              <div className={styles.specBadgesRow}>
                {getResolutionBadge() && (
                  <span className={styles.specBadgeHighlight}>{getResolutionBadge()}</span>
                )}
                {isAspectRatio169() ? (
                  <span className={styles.specBadgeNeutral}>16:9 Console</span>
                ) : (
                  <span className={styles.specBadgeWarning}>Formato livre</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="wp-title-input">
                Título do Wallpaper <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="wp-title-input"
                type="text"
                placeholder="Ex: Master Chief Armor"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.fieldInput}
                maxLength={80}
              />
              <span className={styles.fieldHint}>Nome exibido na sua galeria e nas buscas</span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="wp-game-input">
                Jogo ou Franquia
              </label>
              <input
                id="wp-game-input"
                type="text"
                placeholder="Ex: Halo Infinite, Forza Horizon 5, Starfield"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className={styles.fieldInput}
                maxLength={60}
              />
              <span className={styles.fieldHint}>Permite agrupar wallpapers por franquia ou título</span>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <label className={styles.fieldLabel} htmlFor="wp-tags-input">
                  Tags e Marcadores
                </label>
                <span className={styles.fieldCounter}>{tags.length}/5</span>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="wp-tags-input"
                  type="text"
                  placeholder={tags.length >= 5 ? 'Limite de 5 tags atingido' : 'Digite uma tag e pressione Enter...'}
                  value={tagInput}
                  disabled={tags.length >= 5}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onFocus={() => {
                    if (tagInput.trim().length > 0) {
                      setShowTagSuggestions(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (canCreateTag) {
                        addTag(trimmedTag);
                      }
                    }
                  }}
                  className={styles.fieldInput}
                />
                {showTagSuggestions && canCreateTag && (
                  <div className={styles.dropdownList}>
                    <button
                      type="button"
                      className={`${styles.dropdownItem} ${styles.dropdownCreateItem}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addTag(trimmedTag)}
                    >
                      <Plus size={14} />
                      <span>Adicionar tag &quot;{trimmedTag.toLowerCase()}&quot;</span>
                    </button>
                  </div>
                )}
              </div>

              {tags.length < 5 && dynamicSuggestedTags.length > 0 && (
                <div className={styles.quickTagsContainer}>
                  <span className={styles.quickTagsPrompt}>Sugestões dinâmicas:</span>
                  <div className={styles.quickTagsList}>
                    {dynamicSuggestedTags.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        className={styles.quickTagBtn}
                        onClick={() => addTag(pt)}
                      >
                        +{pt}
                      </button>
                    ))}
                    {dynamicSuggestedTags.length > 1 && tags.length + dynamicSuggestedTags.length <= 5 && (
                      <button
                        type="button"
                        className={styles.quickTagBtnAll}
                        onClick={handleAddAllSuggestions}
                        title="Adicionar todas as sugestões"
                      >
                        + Adicionar todas
                      </button>
                    )}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className={styles.selectedTags}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      <span>#{tag}</span>
                      <button
                        type="button"
                        className={styles.tagRemove}
                        onClick={() => removeTag(tag)}
                        aria-label={`Remover tag ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Modo de Visibilidade</label>
              <div className={styles.visibilityOptions}>
                <button
                  type="button"
                  className={`${styles.visibilityOption} ${!isPublic ? styles.visibilityActive : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <div className={styles.visibilityIconBox}>
                    <Lock size={16} />
                  </div>
                  <div className={styles.visibilityText}>
                    <span className={styles.visibilityTitle}>Privado</span>
                    <span className={styles.visibilityDesc}>Visível apenas para você na sua conta e console</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`${styles.visibilityOption} ${isPublic ? styles.visibilityActive : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <div className={styles.visibilityIconBox}>
                    <Globe size={16} />
                  </div>
                  <div className={styles.visibilityText}>
                    <span className={styles.visibilityTitle}>Público</span>
                    <span className={styles.visibilityDesc}>Disponibilizado na comunidade após moderação</span>
                  </div>
                </button>
              </div>
            </div>

            {Boolean(profile?.assignedCollectionId) && (
              <div className={styles.creatorCollectionSection}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={addToCollection}
                    onChange={(e) => setAddToCollection(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <Layers size={16} />
                  <span>Vincular diretamente à minha coleção oficial parceira</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {(localError || error) && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={16} />
            <span>{localError || error}</span>
          </div>
        )}

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={handleCancel}>
            Descartar
          </button>
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            <UploadCloud size={16} />
            <span>Enviar Wallpaper</span>
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleChange}
          onClick={(e) => {
            e.stopPropagation();
            e.target.value = null;
          }}
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className={`${styles.zone} ${dragging ? styles.zoneDragging : ''} ${isUploadDisabled ? styles.zoneDisabled : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploadDisabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (!isUploadDisabled) handleDrop(e);
        }}
        onClick={() => !isUploadDisabled && inputRef.current?.click()}
        role="button"
        tabIndex={isUploadDisabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !isUploadDisabled && inputRef.current?.click()}
      >
        <div className={styles.icon}>
          {isUploadDisabled ? <Ban size={36} /> : <UploadCloud size={36} />}
        </div>
        <div className={styles.title}>
          {mustBlockVerification
            ? 'Confirmação de e-mail obrigatória'
            : isQuotaFull
            ? 'Limite de imagens atingido'
            : 'Arraste uma imagem ou clique para selecionar'}
        </div>
        <div className={styles.subtitle}>
          {mustBlockVerification
            ? 'Ative sua conta pelo link enviado para seu e-mail antes de enviar papéis de parede.'
            : isQuotaFull
            ? `Você já atingiu o limite de ${userMaxImages} imagens. Remova alguma imagem antiga para enviar novas.`
            : 'Sua imagem será preservada em alta fidelidade para aplicação direta no console.'}
        </div>
        <div className={styles.formats}>
          <span className={styles.badge}>WebP</span>
          <span className={styles.badge}>PNG</span>
          <span className={styles.badge}>JPG</span>
          <span className={styles.badge}>16:9 Nativo</span>
          <span className={styles.badge}>Máx 20 MB</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleChange}
          onClick={(e) => {
            e.stopPropagation();
            e.target.value = null;
          }}
          disabled={isUploadDisabled}
          tabIndex={-1}
        />
      </div>
      {(localError || error) && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={16} />
          <span>{localError || error}</span>
        </div>
      )}
    </div>
  );
}
