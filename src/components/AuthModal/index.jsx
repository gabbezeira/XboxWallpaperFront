import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { signInWithMicrosoft, signInWithEmail, signUpWithEmail } from '../../services/auth'
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

  const handleMicrosoft = () => {
    setError(null)
    signInWithMicrosoft().catch((err) => {
      console.error('Erro no login Microsoft:', err)
      setError('Erro ao redirecionar para a Microsoft')
    })
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

        <button className={styles.btnMicrosoft} onClick={handleMicrosoft}>
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
            <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
            <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
            <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
          </svg>
          Continuar com Microsoft
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
