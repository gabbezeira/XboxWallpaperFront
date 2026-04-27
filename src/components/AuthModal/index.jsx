import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.png'
import styles from './styles.module.scss'

export default function AuthModal({ onClose }) {
  const { refreshProfile } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fecha o modal automaticamente ao logar
  const { user } = useAuth()
  useEffect(() => {
    if (user) {
      onClose()
    }
  }, [user, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        if (!name.trim()) {
          setError('Digite seu nome')
          setLoading(false)
          return
        }
        await signUpWithEmail(email, password, name)
      }
      await refreshProfile()
      onClose()
    } catch (err) {
      console.error('Erro detalhado no submit:', err)
      const messages = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/invalid-credential': 'Email ou senha incorretos'
      }
      setError(messages[err.code] || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setError(null)
    setLoading(true)
    signInWithGoogle()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className={styles.close} onClick={onClose} aria-label="Fechar" autoFocus>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <img src={logo} alt="Xbox" className={styles.logo} />
          <h2 className={styles.title}>
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Entre para acessar seus wallpapers'
              : 'Crie sua conta para enviar wallpapers'}
          </p>
        </div>

        <button className={styles.btnGoogle} onClick={handleGoogle}>
          <svg width="20" height="20" viewBox="0 0 20 20" focusable="false">
            <path fill="#4285f4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34"></path>
            <path fill="#34a853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42z"></path>
            <path fill="#fbbc05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A10 10 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97"></path>
            <path fill="#ea4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88"></path>
          </svg>
          Continuar com Google
        </button>

        <div className={styles.divider}>
          <span>ou entre com email</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label className={styles.label}>Nome</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className={styles.btnSubmit} type="submit" disabled={loading}>
            {loading ? (
              <span className={styles.btnLoading}>
                <span className={styles.btnSpinner} />
                Carregando...
              </span>
            ) : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className={styles.toggle}>
          {mode === 'login' ? (
            <>
              Não tem conta?
              <button onClick={() => { setMode('register'); setError(null) }}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?
              <button onClick={() => { setMode('login'); setError(null) }}>
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
