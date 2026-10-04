import { useState, useEffect } from 'react';
import { X, QrCode, Mail, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import {
  signInWithMicrosoft,
  signInWithEmail,
  signUpWithEmail,
  resendVerificationEmail,
  sendPasswordReset,
} from '../../services/auth';
import { auth } from '../../services/firebase';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (user && view !== 'verify') {
      onClose();
    }
  }, [user, view, onClose]);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError(null);
    setSuccess(null);
  };

  const goBack = () => {
    resetForm();
    setView('main');
  };

  const isStrongPassword = (pwd) =>
    pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (emailMode === 'login') {
        const loggedUser = await signInWithEmail(email, password);
        await refreshProfile();
        if (loggedUser && !loggedUser.emailVerified) {
          setView('verify');
          setLoading(false);
          return;
        }
        onClose();
      } else {
        if (!name.trim()) {
          setError('Digite seu nome');
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('A senha deve ter pelo menos 8 caracteres');
          setLoading(false);
          return;
        }
        if (!isStrongPassword(password)) {
          setError('A senha deve conter letras e números');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name.trim());
        await refreshProfile();
        setCooldown(60);
        setView('verify');
      }
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 8 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/invalid-credential': 'Email ou senha incorretos',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      };
      setError(messages[err.code] || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Informe um email válido');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada e spam.');
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Nenhuma conta encontrada com este email',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
      };
      setError(messages[err.code] || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          await refreshProfile();
          onClose();
          return;
        }
      }
      setError('Email ainda não confirmado. Verifique sua caixa de entrada ou spam e clique no link de ativação.');
    } catch {
      setError('Não foi possível verificar no momento. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldown > 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await resendVerificationEmail();
      setSuccess('Novo email de confirmação enviado com sucesso!');
      setCooldown(60);
    } catch (err) {
      const messages = {
        'auth/too-many-requests': 'Aguarde alguns instantes antes de reenviar.',
      };
      setError(messages[err.code] || 'Falha ao reenviar email. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoft = async () => {
    setLoading(true);
    setError('');

    try {
      const userResult = await signInWithMicrosoft();
      if (userResult) {
        sessionStorage.removeItem('oauth_redirect');
        onClose();
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Ocorreu um erro ao tentar acessar a Microsoft.');
      }
    } finally {
      setLoading(false);
    }
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
              required
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
            minLength={8}
          />
          {emailMode === 'register' && (
            <span className={styles.fieldHint}>
              Mínimo de 8 caracteres contendo letras e números
            </span>
          )}
        </div>

        {emailMode === 'login' && (
          <div className={styles.forgotRow}>
            <button
              type="button"
              className={styles.btnForgotText}
              onClick={() => {
                setError(null);
                setSuccess(null);
                setView('forgot');
              }}
            >
              Esqueceu sua senha?
            </button>
          </div>
        )}

        {emailMode === 'register' && (
          <div className={styles.field}>
            <label className={styles.label}>Confirmar senha</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        )}

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
                setSuccess(null);
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
                setSuccess(null);
              }}
            >
              Entrar
            </button>
          </>
        )}
      </div>
    </>
  );

  const renderForgotView = () => (
    <>
      <div className={styles.headerRow}>
        <button
          className={styles.btnBack}
          onClick={() => {
            setError(null);
            setSuccess(null);
            setView('email');
          }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className={styles.title}>Recuperar senha</h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form className={styles.form} onSubmit={handleForgotPassword}>
        <div className={styles.field}>
          <label className={styles.label}>Email cadastrado</label>
          <input
            className={styles.input}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className={styles.fieldHint}>
            Enviaremos um link seguro para você redefinir sua senha.
          </span>
        </div>

        <button className={styles.btnSubmit} type="submit" disabled={loading}>
          {loading ? (
            <span className={styles.btnLoading}>
              <span className={styles.btnSpinner} />
              Enviando...
            </span>
          ) : (
            'Enviar link de recuperação'
          )}
        </button>
      </form>

      <div className={styles.toggle}>
        Lembrou da senha?
        <button
          onClick={() => {
            setError(null);
            setSuccess(null);
            setView('email');
            setEmailMode('login');
          }}
        >
          Voltar ao login
        </button>
      </div>
    </>
  );

  const renderVerifyView = () => (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyIconBox}>
        <Mail size={28} />
      </div>

      <h2 className={styles.title}>Confirme seu email</h2>

      <p className={styles.verifyText}>
        Enviamos um link de confirmação para{' '}
        <span className={styles.verifyEmailHighlight}>{email || auth.currentUser?.email}</span>.
        Acesse sua caixa de entrada ou spam e clique no link para ativar sua conta.
      </p>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.verifyActions}>
        <button
          className={styles.btnSubmit}
          type="button"
          onClick={handleCheckVerified}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.btnLoading}>
              <span className={styles.btnSpinner} />
              Verificando...
            </span>
          ) : (
            'Já confirmei meu email'
          )}
        </button>

        <button
          className={styles.btnSecondaryAction}
          type="button"
          onClick={handleResendVerification}
          disabled={loading || cooldown > 0}
        >
          {cooldown > 0
            ? `Reenviar em ${cooldown}s`
            : 'Reenviar email de confirmação'}
        </button>

        <button
          className={styles.btnForgotText}
          type="button"
          onClick={onClose}
        >
          Continuar navegando
        </button>
      </div>
    </div>
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
        {view === 'forgot' && renderForgotView()}
        {view === 'verify' && renderVerifyView()}
        {view === 'qrcode' && renderQrCodeView()}
      </div>
    </div>
  );
}
