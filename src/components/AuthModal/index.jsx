import { useState, useEffect } from 'react';
import { X, QrCode, Mail, ArrowLeft } from 'lucide-react';
import { signInWithMicrosoft, signInWithEmail, signUpWithEmail } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import { isXboxConsole } from '../../utils/device';
import DeviceAuth from '../DeviceAuth';
import logo from '../../assets/logosvg.svg';
import styles from './styles.module.scss';

export default function AuthModal({ onClose }) {
  const { refreshProfile, authError, user } = useAuth();
  const isConsole = isXboxConsole();
  const [view, setView] = useState(isConsole ? 'qrcode' : 'main');
  const [emailMode, setEmailMode] = useState('login');
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

  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
  };

  const goBack = () => {
    resetForm();
    setView('main');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (emailMode === 'login') {
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

    setTimeout(() => {
      setRedirecting(false);
      sessionStorage.removeItem('oauth_redirect');
      setError('A conexão expirou. Por favor, verifique sua rede e tente novamente.');
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

  const renderMainView = () => (
    <>
      <div className={styles.header}>
        <img src={logo} alt="Spartan Wallpapers" className={styles.logo} />
        <h2 className={styles.title}>Entrar</h2>
        <p className={styles.subtitle}>Escolha como deseja acessar sua conta</p>
      </div>

      <div className={styles.providerButtons}>
        <button className={styles.btnQrCode} onClick={() => setView('qrcode')}>
          <QrCode size={20} />
          Entrar via QR Code
        </button>

        <button className={styles.btnMicrosoft} onClick={handleMicrosoft}>
          <svg width="20" height="20" viewBox="0 0 21 21" focusable="false">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          Continuar com Microsoft
        </button>

        <button
          className={styles.btnEmail}
          onClick={() => {
            setEmailMode('login');
            setView('email');
          }}
        >
          <Mail size={20} />
          Entrar com Email
        </button>
      </div>

      <div className={styles.toggle}>
        Não tem conta?
        <button
          onClick={() => {
            setEmailMode('register');
            setView('email');
          }}
        >
          Criar conta
        </button>
      </div>
    </>
  );

  const renderEmailView = () => (
    <>
      <div className={styles.headerRow}>
        <button className={styles.btnBack} onClick={goBack} aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        <h2 className={styles.title}>
          {emailMode === 'login' ? 'Entrar com Email' : 'Criar conta'}
        </h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        {emailMode === 'register' && (
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
          ) : emailMode === 'login' ? (
            'Entrar'
          ) : (
            'Criar conta'
          )}
        </button>
      </form>

      <div className={styles.toggle}>
        {emailMode === 'login' ? (
          <>
            Não tem conta?
            <button
              onClick={() => {
                setEmailMode('register');
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
                setEmailMode('login');
                setError(null);
              }}
            >
              Entrar
            </button>
          </>
        )}
      </div>
    </>
  );

  const renderQrCodeView = () => (
    <>
      <div className={styles.headerRow}>
        {!isConsole && (
          <button className={styles.btnBack} onClick={goBack} aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className={styles.title}>Conectar via QR Code</h2>
      </div>

      <DeviceAuth onSuccess={onClose} />

      {!isConsole && (
        <div className={styles.toggle}>
          <button onClick={goBack}>Usar outro método</button>
        </div>
      )}
    </>
  );

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

        {view === 'main' && renderMainView()}
        {view === 'email' && renderEmailView()}
        {view === 'qrcode' && renderQrCodeView()}
      </div>
    </div>
  );
}
