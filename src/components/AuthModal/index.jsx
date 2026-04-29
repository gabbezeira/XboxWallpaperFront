import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { signInWithMicrosoft, signInWithEmail, signUpWithEmail } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';
import styles from './styles.module.scss';

export default function AuthModal({ onClose }) {
  const { refreshProfile, authError } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('Digite seu nome');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
      }
      await refreshProfile();
      onClose();
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/invalid-credential': 'Email ou senha incorretos',
      };
      setError(messages[err.code] || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoft = () => {
    setRedirecting(true);
    sessionStorage.setItem('oauth_redirect', 'true');
    
    signInWithMicrosoft().catch((err) => {
      console.warn('Erro ao iniciar redirecionamento:', err);
      setRedirecting(false);
      sessionStorage.removeItem('oauth_redirect');
      setError('Ocorreu um erro ao tentar acessar a Microsoft.');
    });

    // Fallback caso a navegação falhe silenciosamente (ex: bloqueadores agressivos)
    setTimeout(() => {
      setRedirecting(false);
      sessionStorage.removeItem('oauth_redirect');
    }, 10000);
  };

  if (redirecting) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal} role="dialog" aria-modal="true">
          <div className={styles.redirecting}>
            <span className={styles.redirectSpinner} />
            <p>Redirecionando para o provedor de login...</p>
          </div>
        </div>
      </div>
    );
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

        <div className={styles.providerButtons}>
          <button className={styles.btnMicrosoft} onClick={handleMicrosoft}>
            <svg width="20" height="20" viewBox="0 0 21 21" focusable="false">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Continuar com Microsoft
          </button>
        </div>

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
            ) : mode === 'login' ? (
              'Entrar'
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <div className={styles.toggle}>
          {mode === 'login' ? (
            <>
              Não tem conta?
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
