import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Ban, X, Lock, Globe, Layers, Plus } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import styles from './styles.module.scss';

const SUGGESTED_GAMES = [
  'Halo Infinite',
  'Forza Horizon 5',
  'Gears 5',
  'Minecraft',
  'Starfield',
  'Sea of Thieves',
  'Cyberpunk 2077',
  'Elden Ring',
  'Grounded',
  'Redfall',
  'Hi-Fi RUSH',
  'Hellblade II',
];

const DEFAULT_EXISTING_TAGS = [
  'Halo',
  'Forza',
  'Gears',
  'Minecraft',
  'Starfield',
  'Sea of Thieves',
  'Cyberpunk 2077',
  'Elden Ring',
  'Hi-Fi RUSH',
  'Hellblade II',
  'Dark',
  'Abstract',
  'Nature',
  'Minimal',
  'Retro',
  'Neon',
  'Space',
  'Sci-Fi',
  'Landscape',
  'Anime',
  '4K',
  'OLED',
];

export default function UploadZone({ onUploadComplete }) {
  const { upload, uploading, progress, error } = useUpload();
  const { profile } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [addToCollection, setAddToCollection] = useState(false);
  const [existingTags, setExistingTags] = useState(DEFAULT_EXISTING_TAGS);

  const [showGameSuggestions, setShowGameSuggestions] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const inputRef = useRef(null);

  const userMaxImages = Math.max(10, profile?.maxImages || 10);
  const isQuotaFull = profile && (profile.imageCount || 0) >= userMaxImages;

  useEffect(() => {
    let isMounted = true;
    api.collections
      .list()
      .then((colls) => {
        if (!isMounted || !Array.isArray(colls)) return;
        const tagSet = new Set(DEFAULT_EXISTING_TAGS);
        colls.forEach((c) => {
          if (c.title) tagSet.add(c.title);
          if (c.slug) tagSet.add(c.slug);
        });
        setExistingTags(Array.from(tagSet));
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectFile = (file) => {
    setLocalError(null);

    const isImage =
      file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    if (!isImage) {
      setLocalError('Apenas imagens são permitidas');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setLocalError('Imagem muito grande (máx. 20 MB)');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      await upload(selectedFile, {
        title: title || null,
        game: game || null,
        tags,
        isPublic,
        collectionId: addToCollection && profile?.assignedCollectionId ? profile.assignedCollectionId : null,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
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
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setGame('');
    setTags([]);
    setIsPublic(false);
    setAddToCollection(false);
    setLocalError(null);
  };

  const addTag = (tag) => {
    const cleaned = tag.trim();
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags((prev) => [...prev, cleaned]);
      setExistingTags((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleGameSelect = (selectedGame) => {
    setGame(selectedGame);
    setShowGameSuggestions(false);
    addTag(selectedGame);
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

  const filteredGames = SUGGESTED_GAMES.filter((g) => g.toLowerCase().includes(game.toLowerCase()));
  const trimmedTag = tagInput.trim();
  const filteredTags = existingTags.filter(
    (t) => t.toLowerCase().includes(trimmedTag.toLowerCase()) && !tags.includes(t),
  );
  const exactMatchExists = existingTags.some(
    (t) => t.toLowerCase() === trimmedTag.toLowerCase(),
  );
  const canCreateTag = trimmedTag.length > 0 && !exactMatchExists && !tags.includes(trimmedTag);

  if (uploading) {
    return (
      <div className={styles.zone}>
        <div className={styles.uploading}>
          <div className={styles.spinner} />
          <span className={styles.progressText}>{progress}</span>
        </div>
      </div>
    );
  }

  if (selectedFile && previewUrl) {
    return (
      <div className={styles.formContainer}>
        <div className={styles.previewRow}>
          <img src={previewUrl} alt="Preview" className={styles.preview} />
          <div className={styles.formFields}>
            <input
              type="text"
              placeholder="Nome do wallpaper"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.fieldInput}
            />

            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Jogo (ex: Halo Infinite)"
                value={game}
                onChange={(e) => {
                  setGame(e.target.value);
                  setShowGameSuggestions(true);
                }}
                onFocus={() => setShowGameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowGameSuggestions(false), 200)}
                className={styles.fieldInput}
              />
              {showGameSuggestions && filteredGames.length > 0 && (
                <div className={styles.dropdownList}>
                  {filteredGames.map((g) => (
                    <button
                      key={g}
                      className={styles.dropdownItem}
                      onClick={() => handleGameSelect(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.tagSection}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Adicionar tag..."
                  value={tagInput}
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
                      if (tagInput.trim()) {
                        addTag(tagInput.trim());
                      }
                    }
                  }}
                  className={styles.fieldInput}
                />
                {showTagSuggestions && trimmedTag.length > 0 && (filteredTags.length > 0 || canCreateTag) && (
                  <div className={styles.dropdownList}>
                    {filteredTags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => addTag(t)}
                      >
                        {t}
                      </button>
                    ))}
                    {canCreateTag && (
                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${styles.dropdownCreateItem}`}
                        onClick={() => addTag(trimmedTag)}
                      >
                        <Plus size={14} />
                        <span>Criar tag &quot;{trimmedTag}&quot;</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {tags.length > 0 && (
                <div className={styles.selectedTags}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                      <button className={styles.tagRemove} onClick={() => removeTag(tag)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.visibilitySection}>
              <div className={styles.visibilityOptions}>
                <button
                  type="button"
                  className={`${styles.visibilityOption} ${!isPublic ? styles.visibilityActive : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <Lock size={16} />
                  <div className={styles.visibilityText}>
                    <span className={styles.visibilityTitle}>Privado</span>
                    <span className={styles.visibilityDesc}>Apenas você vê</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`${styles.visibilityOption} ${isPublic ? styles.visibilityActive : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <Globe size={16} />
                  <div className={styles.visibilityText}>
                    <span className={styles.visibilityTitle}>Público</span>
                    <span className={styles.visibilityDesc}>Enviar para a comunidade</span>
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
                  <span>Incluir na minha coleção oficial de parceiro</span>
                </label>
              </div>
            )}
          </div>
        </div>
        <div className={styles.formActions}>
          <button className={styles.btnCancel} onClick={handleCancel}>
            Cancelar
          </button>
          <button className={styles.btnSubmit} onClick={handleSubmit}>
            Enviar Wallpaper
          </button>
        </div>
        {(localError || error) && <div className={styles.error}>{localError || error}</div>}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`${styles.zone} ${dragging ? styles.zoneDragging : ''} ${isQuotaFull ? styles.zoneDisabled : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isQuotaFull && inputRef.current?.click()}
        role="button"
        tabIndex={isQuotaFull ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !isQuotaFull && inputRef.current?.click()}
      >
        <div className={styles.icon}>
          {isQuotaFull ? <Ban size={48} /> : <UploadCloud size={48} />}
        </div>
        <div className={styles.title}>
          {isQuotaFull ? 'Limite de imagens atingido' : 'Arraste uma imagem ou clique para enviar'}
        </div>
        <div className={styles.subtitle}>
          {isQuotaFull
            ? `Você já tem ${userMaxImages} imagens. Delete alguma para enviar novas.`
            : 'Sua imagem será processada para garantir a melhor qualidade (máx 20MB)'}
        </div>
        <div className={styles.formats}>
          <span className={styles.badge}>JPG</span>
          <span className={styles.badge}>PNG</span>
          <span className={styles.badge}>WebP</span>
          <span className={styles.badge}>Máx 20 MB</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.input}
          onChange={handleChange}
          onClick={(e) => {
            e.stopPropagation();
            e.target.value = null;
          }}
          disabled={isQuotaFull}
          tabIndex={-1}
        />
      </div>
      {(localError || error) && <div className={styles.error}>{localError || error}</div>}
    </div>
  );
}
