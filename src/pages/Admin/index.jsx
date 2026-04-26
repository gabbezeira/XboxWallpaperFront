import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../services/firebase'
import { UploadCloud, Image as ImageIcon, LogOut, LayoutGrid, Images } from 'lucide-react'
import Modal from '../../components/Modal'
import ManageWallpapers from './ManageWallpapers'
import ManageHeroSlides from './ManageHeroSlides'
import styles from './styles.module.scss'

const API_URL = String(import.meta.env.VITE_API_URL).replace(/\/$/, '')

async function getAdminToken() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  return user.getIdToken(true)
}

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('publish')

  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', targetTag: '', file: null })
  const [wallForm, setWallForm] = useState({ title: '', game: '', tags: '', file: null })

  const [heroLoading, setHeroLoading] = useState(false)
  const [wallLoading, setWallLoading] = useState(false)

  const [modal, setModal] = useState({ open: false, title: '', message: '', variant: 'success' })

  const showModal = (title, message, variant = 'success') => {
    setModal({ open: true, title, message, variant })
  }

  const closeModal = () => {
    setModal({ open: false, title: '', message: '', variant: 'success' })
  }

  const handleHeroSubmit = async (e) => {
    e.preventDefault()
    if (!heroForm.file) return
    setHeroLoading(true)

    try {
      const token = await getAdminToken()
      const formData = new FormData()
      formData.append('image', heroForm.file)
      formData.append('title', heroForm.title)
      formData.append('subtitle', heroForm.subtitle)
      formData.append('targetTag', heroForm.targetTag)

      const res = await fetch(`${API_URL}/api/hero-slides/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setHeroForm({ title: '', subtitle: '', targetTag: '', file: null })
      showModal('Sucesso', 'Hero Slide cadastrado com sucesso!', 'success')
    } catch (error) {
      showModal('Erro no Upload', error.message, 'danger')
    } finally {
      setHeroLoading(false)
    }
  }

  const handleWallSubmit = async (e) => {
    e.preventDefault()
    if (!wallForm.file) return
    setWallLoading(true)

    try {
      const token = await getAdminToken()
      const tagsArray = wallForm.tags.split(',').map(t => t.trim()).filter(Boolean)

      const formData = new FormData()
      formData.append('image', wallForm.file)
      formData.append('title', wallForm.title)
      formData.append('game', wallForm.game)
      formData.append('tags', JSON.stringify(tagsArray))
      formData.append('isPublic', 'true')

      const res = await fetch(`${API_URL}/api/wallpapers/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setWallForm({ title: '', game: '', tags: '', file: null })
      showModal('Sucesso', 'Wallpaper público cadastrado com sucesso!', 'success')
    } catch (error) {
      showModal('Erro no Upload', error.message, 'danger')
    } finally {
      setWallLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.title}>Painel de administração</h1>
          <p className={styles.lead}>Publicar conteúdo, gerir wallpapers e destaques do carrossel.</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={() => navigate('/')} className={styles.btnGhost}>
            <LogOut size={16} aria-hidden /> Sair do painel
          </button>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Secções do painel">
        <button
          type="button"
          className={`${styles.btnTab} ${activeTab === 'publish' ? styles.btnTabActive : ''}`}
          onClick={() => setActiveTab('publish')}
        >
          <LayoutGrid size={16} aria-hidden />
          Publicar
        </button>
        <button
          type="button"
          className={`${styles.btnTab} ${activeTab === 'wallpapers' ? styles.btnTabActive : ''}`}
          onClick={() => setActiveTab('wallpapers')}
        >
          <Images size={16} aria-hidden />
          Wallpapers
        </button>
        <button
          type="button"
          className={`${styles.btnTab} ${activeTab === 'hero' ? styles.btnTabActive : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <ImageIcon size={16} aria-hidden />
          Destaques
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'publish' && (
          <div className={styles.publish}>
            <div className={styles.publishGrid}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}><ImageIcon size={20} /> Novo hero slide</h2>
              <form onSubmit={handleHeroSubmit} className={styles.form}>
                <div
                  className={`${styles.drop} ${heroForm.file ? styles.dropReady : ''}`}
                >
                  <div className={styles.dropContent}>
                    <UploadCloud size={32} color="#107C10" aria-hidden />
                    {heroForm.file
                      ? <p className={styles.dropName}>{heroForm.file.name}</p>
                      : <p className={styles.dropHint}>Clique para selecionar (1920×1080)</p>
                    }
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.dropInput}
                    aria-label="Selecionar imagem do hero (1920×1080)"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setHeroForm((prev) => ({ ...prev, file }))
                      }
                      const el = e.target
                      queueMicrotask(() => {
                        el.value = ''
                      })
                    }}
                  />
                </div>

                <textarea
                  className={styles.textarea}
                  placeholder="Título do slide (Enter para quebrar linha)"
                  value={heroForm.title}
                  onChange={e => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                />

                <textarea
                  className={styles.textarea}
                  placeholder="Subtítulo (Enter para quebrar linha)"
                  value={heroForm.subtitle}
                  onChange={e => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                />

                <input
                  type="text"
                  className={styles.field}
                  placeholder="Tag de destino (ex: forza)"
                  value={heroForm.targetTag}
                  onChange={e => setHeroForm(prev => ({ ...prev, targetTag: e.target.value }))}
                />

                <button type="submit" disabled={heroLoading || !heroForm.file} className={styles.formSubmit}>
                  {heroLoading ? 'Enviando...' : 'Cadastrar hero slide'}
                </button>
              </form>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}><UploadCloud size={20} /> Novo wallpaper público</h2>
              <form onSubmit={handleWallSubmit} className={styles.form}>
                <div
                  className={`${styles.drop} ${wallForm.file ? styles.dropReady : ''}`}
                >
                  <div className={styles.dropContent}>
                    <UploadCloud size={32} color="#107C10" aria-hidden />
                    {wallForm.file
                      ? <p className={styles.dropName}>{wallForm.file.name}</p>
                      : <p className={styles.dropHint}>Clique para selecionar imagem</p>
                    }
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.dropInput}
                    aria-label="Selecionar imagem do wallpaper"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setWallForm((prev) => ({ ...prev, file }))
                      }
                      const el = e.target
                      queueMicrotask(() => {
                        el.value = ''
                      })
                    }}
                  />
                </div>

                <input
                  type="text"
                  className={styles.field}
                  placeholder="Título (ex: Halo Infinite)"
                  value={wallForm.title}
                  onChange={e => setWallForm(prev => ({ ...prev, title: e.target.value }))}
                />

                <input
                  type="text"
                  className={styles.field}
                  placeholder="Jogo / tema (ex: Halo)"
                  value={wallForm.game}
                  onChange={e => setWallForm(prev => ({ ...prev, game: e.target.value }))}
                />

                <input
                  type="text"
                  className={styles.field}
                  placeholder="Tags separadas por vírgula (halo, fps, master chief)"
                  value={wallForm.tags}
                  onChange={e => setWallForm(prev => ({ ...prev, tags: e.target.value }))}
                />

                <button type="submit" disabled={wallLoading || !wallForm.file} className={styles.formSubmit}>
                  {wallLoading ? 'Enviando...' : 'Cadastrar wallpaper público'}
                </button>
              </form>
            </section>
            </div>
          </div>
        )}

        {activeTab === 'wallpapers' && <ManageWallpapers />}
        {activeTab === 'hero' && <ManageHeroSlides />}
      </main>

      <Modal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onConfirm={closeModal}
        confirmText="OK"
      />
    </div>
  )
}
