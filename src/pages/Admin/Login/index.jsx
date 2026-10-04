import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import styles from './styles.module.scss';
import logo from '../../../assets/logosvg.svg';

const MAX_ATTEMPTS = 5;
const LOCKOUT_KEY = 'spartan_admin_lockout_until';
const ATTEMPTS_KEY = 'spartan_admin_failed_attempts';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const navigate = useNavigate();
  const { user, isAdmin, refreshAdminStatus, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkLockout = () => {
      const storedUntil = parseInt(sessionStorage.getItem(LOCKOUT_KEY) || '0', 10);
      const remainingMs = storedUntil - Date.now();
      if (remainingMs > 0) {
        setLockoutSeconds(Math.ceil(remainingMs / 1000));
      } else {
        setLockoutSeconds(0);
        sessionStorage.removeItem(LOCKOUT_KEY);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/adminpanel" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Informe seu email');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Informe um email válido');
      return;
    }
    if (!password) {
      setError('Informe sua senha');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);

      try {
        await api.admin.verifyAuth();
      } catch {
        const tokenResult = await userCredential.user.getIdTokenResult(true);
        if (!tokenResult.claims.admin) {
          await auth.signOut();
          setError('Acesso negado. Esta conta não possui privilégios de administrador.');
          return;
        }
      }

      sessionStorage.removeItem(ATTEMPTS_KEY);
      sessionStorage.removeItem(LOCKOUT_KEY);

      if (refreshAdminStatus) {
        await refreshAdminStatus();
      }

      navigate('/adminpanel', { replace: true });
    } catch (err) {
      const currentAttempts = parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
      sessionStorage.setItem(ATTEMPTS_KEY, String(currentAttempts));

      if (currentAttempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + 60 * 1000;
        sessionStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
        setLockoutSeconds(60);
        sessionStorage.setItem(ATTEMPTS_KEY, '0');
        setError('Muitas tentativas sem sucesso. Bloqueado por 60 segundos por segurança.');
      } else {
        const remaining = MAX_ATTEMPTS - currentAttempts;
        const code =
          err?.code ||
          err?.error?.code ||
          (typeof err?.message === 'string' && err.message.match(/auth\/[a-z0-9-]+/i)?.[0]) ||
          '';

        let baseMsg = 'Email ou senha incorretos.';
        if (code === 'auth/invalid-email') {
          baseMsg = 'Formato de email inválido.';
        } else if (code === 'auth/user-disabled') {
          baseMsg = 'Esta conta foi desativada.';
        } else if (code === 'auth/network-request-failed') {
          baseMsg = 'Falha de conexão. Verifique sua internet.';
        } else if (code === 'auth/too-many-requests') {
          baseMsg = 'Muitas tentativas sem sucesso. Aguarde alguns minutos.';
        }

        setError(`${baseMsg} (${remaining} tentativa${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''})`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.brand}>
          <img src={logo} alt="Spartan Wallpapers Admin" className={styles.logo} />
          <h1>Entrar</h1>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label>Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading || lockoutSeconds > 0} className={styles.submitBtn}>
            {lockoutSeconds > 0
              ? `Bloqueado (${lockoutSeconds}s)`
              : loading
                ? 'Autenticando...'
                : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
