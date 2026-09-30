import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { useAuth } from '../../../hooks/useAuth';
import styles from './styles.module.scss';
import logo from '../../../assets/logosvg.svg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, refreshAdminStatus, loading: authLoading } = useAuth();

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
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (!tokenResult.claims.admin) {
        await auth.signOut();
        setError('Acesso negado. Esta conta não possui privilégios de administrador.');
        return;
      }

      if (refreshAdminStatus) {
        await refreshAdminStatus();
      }

      navigate('/adminpanel', { replace: true });
    } catch (err) {
      setError('Falha ao autenticar. Verifique seus dados.');
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
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label>Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
