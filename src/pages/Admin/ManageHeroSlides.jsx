import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import Modal from '../../components/Modal'
import styles from './styles.module.scss'

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '')

function slideImageSrc(slide) {
  if (!slide?.imageUrl) return ''
  if (slide.imageUrl.startsWith('http')) return slide.imageUrl
  return `${API_URL}${slide.imageUrl.startsWith('/') ? '' : '/'}${slide.imageUrl}`
}

export default function ManageHeroSlides() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [loadError, setLoadError] = useState('')

  const [confirmModal, setConfirmModal] = useState({ open: false, id: null })
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', variant: 'success' })

  const fetchSlides = async () => {
    try {
      setLoadError('')
      setLoading(true)
      const data = await api.heroSlides.listManage()
      setSlides(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao listar destaques:', err)
      setLoadError('Não foi possível carregar os slides do hero.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const promptDelete = (id) => {
    setConfirmModal({ open: true, id })
  }

  const confirmDelete = async () => {
    const id = confirmModal.id
    setConfirmModal({ open: false, id: null })
    setDeletingId(id)

    try {
      await api.heroSlides.remove(id)
      setSlides((prev) => prev.filter((s) => s.id !== id))
      setAlertModal({
        open: true,
        title: 'Excluído',
        message: 'O slide foi removido. A home pode levar um instante para atualizar o cache.',
        variant: 'success',
      })
    } catch {
      setAlertModal({
        open: true,
        title: 'Erro',
        message: 'Não foi possível excluir o slide.',
        variant: 'danger',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const cancelDelete = () => {
    setConfirmModal({ open: false, id: null })
  }

  return (
    <div className={styles.manage}>
      <div className={styles.listHeader}>
        <div className={styles.listHeaderText}>
          <h2 className={styles.listHeaderTitle}>Destaques (hero)</h2>
          <p className={styles.listHint}>
            O que estiver listado aqui aparece no carrossel (do mais recente para o mais antigo). Para retirar um
            destaque, exclua o slide.
          </p>
        </div>
      </div>

      {loadError && <p className={styles.errorBanner}>{loadError}</p>}

      {slides.length === 0 && !loading && !loadError && (
        <p className={styles.listEmpty}>Nenhum slide cadastrado. Use a aba &quot;Publicar&quot; para enviar imagens.</p>
      )}

      {slides.length > 0 && (
        <div className={styles.heroGrid} role="list">
          {slides.map((slide) => {
            const src = slideImageSrc(slide)
            return (
              <article key={slide.id} className={styles.heroCard} role="listitem">
                <div className={styles.heroCardThumb}>
                  {src ? (
                    <img className={styles.heroCardImg} src={src} alt={slide.title || 'Slide'} loading="lazy" />
                  ) : (
                    <div className={styles.heroCardEmpty} aria-hidden>
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className={styles.heroCardOverlay} aria-hidden={false}>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => promptDelete(slide.id)}
                      disabled={deletingId === slide.id}
                      title="Excluir slide"
                      aria-label="Excluir slide"
                    >
                      {deletingId === slide.id ? (
                        <Loader2 size={18} className={styles.spin} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className={styles.heroCardFoot}>
                  <h3 className={`${styles.heroCardTitle} ${styles.heroCardMetaPre}`}>
                    {slide.title || 'Sem título'}
                  </h3>
                  {Boolean(slide.subtitle) && (
                    <p className={`${styles.heroCardMeta} ${styles.heroCardMetaPre}`}>
                      {slide.subtitle}
                    </p>
                  )}
                  {Boolean(slide.targetTag) && (
                    <p className={styles.heroCardMeta}>Coleção: {slide.targetTag}</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {loading && (
        <div className={styles.loadRow} aria-live="polite" aria-busy="true">
          <Loader2 size={24} className={styles.spin} />
        </div>
      )}

      <Modal
        isOpen={confirmModal.open}
        title="Excluir destaque"
        message="Excluir este slide do carrossel? A imagem será removida do armazenamento e a home deixará de exibi-la."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <Modal
        isOpen={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => setAlertModal((prev) => ({ ...prev, open: false }))}
        confirmText="OK"
        variant={alertModal.variant}
      />
    </div>
  )
}
