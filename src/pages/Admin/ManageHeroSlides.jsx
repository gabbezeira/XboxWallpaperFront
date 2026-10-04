import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Trash2,
  Image as ImageIcon,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  CheckCircle2,
  PauseCircle,
  UploadCloud,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import AdminHeader from './components/AdminHeader';
import styles from './styles.module.scss';

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '');

function slideImageSrc(slide) {
  if (!slide?.imageUrl) return '';
  if (slide.imageUrl.startsWith('http')) return slide.imageUrl;
  return `${API_URL}${slide.imageUrl.startsWith('/') ? '' : '/'}${slide.imageUrl}`;
}

export default function ManageHeroSlides() {
  const [slides, setSlides] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formTargetTag, setFormTargetTag] = useState('');
  const [formButtonText, setFormButtonText] = useState('Ver Coleção');
  const [formOrder, setFormOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, title: '' });
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  const fetchSlides = async () => {
    try {
      setLoadError('');
      setLoading(true);
      const [slidesData, colsData] = await Promise.all([
        api.heroSlides.listManage(),
        api.collections.list().catch(() => []),
      ]);
      setSlides(Array.isArray(slidesData) ? slidesData : []);
      setCollections(Array.isArray(colsData) ? colsData : []);
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

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormTargetTag('');
    setFormButtonText('Ver Coleção');
    setFormOrder(slides.length + 1);
    setFormIsActive(true);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (slide) => {
    setEditingSlide(slide);
    setFormTitle(slide.title || '');
    setFormSubtitle(slide.subtitle || '');
    setFormTargetTag(slide.targetTag || '');
    setFormButtonText(slide.buttonText || 'Ver Coleção');
    setFormOrder(typeof slide.order === 'number' ? slide.order : 1);
    setFormIsActive(slide.isActive !== false);
    setSelectedFile(null);
    setPreviewUrl(slideImageSrc(slide));
    setFormError('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFormError('');
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!editingSlide && !selectedFile) {
      setFormError('Por favor, selecione uma imagem para o novo slide.');
      return;
    }

    try {
      setSaving(true);

      if (editingSlide) {
        const cleanTargetTag = formTargetTag ? formTargetTag.trim() : '';

        await api.heroSlides.update(editingSlide.id, {
          title: formTitle,
          subtitle: formSubtitle,
          targetTag: cleanTargetTag,
          buttonText: formButtonText,
          order: Number(formOrder) || 1,
          isActive: formIsActive,
        });

        setActionSuccess('Slide atualizado com sucesso.');
      } else {
        const cleanTargetTag = formTargetTag ? formTargetTag.trim() : '';
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('title', formTitle);
        formData.append('subtitle', formSubtitle);
        formData.append('targetTag', cleanTargetTag);
        formData.append('buttonText', formButtonText);
        formData.append('order', String(Number(formOrder) || 1));
        formData.append('isActive', String(formIsActive));

        await api.heroSlides.upload(formData);
        setActionSuccess('Novo Hero Slide cadastrado com sucesso.');
      }

      setModalOpen(false);
      await fetchSlides();
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      setFormError(err.message || 'Erro ao salvar o slide.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (index) => {
    if (index <= 0) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;

    const orders = newSlides.map((s, idx) => ({ id: s.id, order: idx + 1 }));
    newSlides.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSlides(newSlides);

    try {
      await api.heroSlides.reorder(orders);
    } catch {
      await fetchSlides();
    }
  };

  const handleMoveDown = async (index) => {
    if (index >= slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;

    const orders = newSlides.map((s, idx) => ({ id: s.id, order: idx + 1 }));
    newSlides.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSlides(newSlides);

    try {
      await api.heroSlides.reorder(orders);
    } catch {
      await fetchSlides();
    }
  };

  const handleToggleActive = async (slide) => {
    const nextState = !slide.isActive;
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, isActive: nextState } : s))
    );

    try {
      await api.heroSlides.update(slide.id, { isActive: nextState });
    } catch {
      await fetchSlides();
    }
  };

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null, title: '' });
    setDeletingId(id);

    try {
      await api.heroSlides.remove(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      setActionSuccess('Slide excluído com sucesso.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch {
      alert('Não foi possível excluir o slide.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loader text="Carregando destaques do hero..." />;
  }

  const activeCount = slides.filter((s) => s.isActive !== false).length;

  return (
    <div className={styles.viewContainer}>
      <AdminHeader
        title="Gestão de Hero Slides"
        subtitle="Configure os banners principais da Home, defina a ordem exata de transição, títulos, tags e botões de chamada."
        badge={`${slides.length} slides (${activeCount} ativos)`}
      >
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={fetchSlides}
          title="Atualizar lista"
        >
          <RefreshCw size={14} />
          <span>Atualizar</span>
        </button>

        <button
          type="button"
          className={styles.btnPrimary}
          onClick={openCreateModal}
        >
          <Plus size={16} />
          <span>Novo Hero Slide</span>
        </button>
      </AdminHeader>

      {actionSuccess && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loadError && (
        <div className={styles.errorAlert}>
          <span>{loadError}</span>
        </div>
      )}

      {slides.length === 0 && !loadError ? (
        <div className={styles.emptyState}>
          <ImageIcon size={44} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Nenhum Hero Slide Cadastrado</h3>
          <p className={styles.emptyText}>
            Crie o primeiro banner de destaque para ser exibido no carrossel dinâmico da Home.
          </p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <Plus size={15} />
            <span>Cadastrar Primeiro Slide</span>
          </button>
        </div>
      ) : (
        <div className={styles.heroSlidesList}>
          {slides.map((s, index) => {
            const src = slideImageSrc(s);
            const isFirst = index === 0;
            const isLast = index === slides.length - 1;
            const isActive = s.isActive !== false;

            return (
              <div
                key={s.id}
                className={`${styles.heroSlideRowCard} ${!isActive ? styles.heroSlideInactive : ''}`}
              >
                <div className={styles.heroOrderColumn}>
                  <button
                    type="button"
                    className={styles.orderBtn}
                    onClick={() => handleMoveUp(index)}
                    disabled={isFirst}
                    title="Mover para cima"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <span className={styles.orderNumberBadge}>#{index + 1}</span>
                  <button
                    type="button"
                    className={styles.orderBtn}
                    onClick={() => handleMoveDown(index)}
                    disabled={isLast}
                    title="Mover para baixo"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className={styles.heroSlidePreviewWrapper}>
                  <img src={src} alt={s.title || ''} className={styles.heroSlideThumb} />
                  <div className={styles.heroSlideThumbGradient} />
                  <div className={styles.heroSlideThumbText}>
                    <span className={styles.thumbTitle}>{s.title || 'Sem Título'}</span>
                    {s.buttonText && (
                      <span className={styles.thumbButton}>{s.buttonText}</span>
                    )}
                  </div>
                </div>

                <div className={styles.heroSlideMetaCol}>
                  <div className={styles.heroMetaTopRow}>
                    <h3 className={styles.heroSlideTitleText}>{s.title || 'Sem título'}</h3>
                    <button
                      type="button"
                      className={`${styles.statusToggleBtn} ${isActive ? styles.statusActive : styles.statusPaused}`}
                      onClick={() => handleToggleActive(s)}
                      title={isActive ? 'Pausar exibição deste slide' : 'Ativar exibição deste slide'}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle size={13} />
                          <span>Pausado</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className={styles.heroSlideSubtitleText}>
                    {s.subtitle || 'Sem subtítulo configurado'}
                  </p>

                  <div className={styles.heroSlidePillRow}>
                    {s.targetTag && (
                      <span className={styles.tagPill}>
                        <ExternalLink size={11} />
                        <span>Tag: #{s.targetTag}</span>
                      </span>
                    )}
                    <span className={styles.tagPill}>
                      <span>Botão: &quot;{s.buttonText || 'Ver Coleção'}&quot;</span>
                    </span>
                    <span className={styles.tagPill}>
                      <span>Ordem: {s.order ?? index + 1}</span>
                    </span>
                  </div>
                </div>

                <div className={styles.heroSlideRowActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => openEditModal(s)}
                    title="Editar Slide"
                  >
                    <Edit2 size={14} />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnDangerIconSmall}
                    onClick={() => setConfirmModal({ open: true, id: s.id, title: s.title || 'Slide' })}
                    disabled={deletingId === s.id}
                    title="Excluir Slide"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingSlide ? 'Editar Hero Slide' : 'Cadastrar Novo Hero Slide'}
              </h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSlide}>
              <div className={styles.modalBody}>
                {formError && (
                  <div className={styles.errorAlert}>
                    <span>{formError}</span>
                  </div>
                )}

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>
                    {editingSlide ? 'Imagem do Banner (Deixe vazio para manter)' : 'Imagem do Banner (16:9) *'}
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className={styles.hiddenFileInput}
                  />

                  <div
                    className={styles.heroDropZone}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const droppedFile = e.dataTransfer.files[0];
                        if (droppedFile.type.startsWith('image/')) {
                          setFile(droppedFile);
                          setPreviewUrl(URL.createObjectURL(droppedFile));
                          setFormError('');
                        }
                      }
                    }}
                  >
                    {previewUrl ? (
                      <div className={styles.heroPreviewContainer}>
                        <img src={previewUrl} alt="Preview" className={styles.heroPreviewImg} />
                        <div className={styles.heroPreviewOverlay}>
                          <UploadCloud size={20} />
                          <span>Clique para alterar imagem</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.heroDropPrompt}>
                        <UploadCloud size={32} />
                        <span className={styles.dropMainText}>Clique ou arraste a imagem do banner</span>
                        <span className={styles.dropSubText}>Proporção 16:9 (1920x1080 ou superior em JPG/PNG/WebP)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Título Principal *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Halo Infinite: Temporada 5"
                    required
                    className={styles.fieldInput}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Subtítulo / Descrição</label>
                  <textarea
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Ex: Novos wallpapers em resolução máxima 4K HDR para sua dashboard."
                    rows={2}
                    className={styles.fieldTextarea}
                  />
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Coleção Rápida</label>
                    <select
                      value={collections.some((c) => (c.slug || c.name.toLowerCase()) === formTargetTag) ? formTargetTag : ''}
                      onChange={(e) => setFormTargetTag(e.target.value)}
                      className={styles.fieldSelect}
                    >
                      <option value="">Personalizada / Nenhuma</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.slug || c.name.toLowerCase()}>
                          Coleção: {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Tag ou Destino Manual</label>
                    <input
                      type="text"
                      value={formTargetTag}
                      onChange={(e) => setFormTargetTag(e.target.value)}
                      placeholder="Ex: Forza Horizon, Halo, Cyberpunk 2077"
                      className={styles.fieldInput}
                    />
                  </div>
                </div>

                <div className={styles.formRowTwo}>
                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Texto do Botão de Ação</label>
                    <input
                      type="text"
                      value={formButtonText}
                      onChange={(e) => setFormButtonText(e.target.value)}
                      placeholder="Ex: Ver Coleção"
                      className={styles.fieldInput}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.fieldLabel}>Ordem de Exibição</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={formOrder}
                      onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 1)}
                      className={styles.fieldInput}
                    />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                    />
                    <span>Slide ativo (visível no carrossel da Home)</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : editingSlide ? 'Salvar Alterações' : 'Criar Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal({ open: false, id: null, title: '' })}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Excluir Hero Slide</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setConfirmModal({ open: false, id: null, title: '' })}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.emptyText}>
                Tem certeza que deseja remover o slide <strong>&quot;{confirmModal.title}&quot;</strong> do carrossel principal? O arquivo no Storage também será apagado.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setConfirmModal({ open: false, id: null, title: '' })}
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
