import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Monitor, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import AuthModal from '../../components/AuthModal';
import styles from './styles.module.scss';

export default function LinkDevice() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Por favor, digite o código de 6 caracteres.');
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.deviceAuth.authorize(code);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Monitor size={32} />
        </div>

        <h1 className={styles.title}>Conectar ao Xbox</h1>
        <p className={styles.subtitle}>
          Autorize o navegador do seu console para acessar sua conta e gerenciar seus wallpapers.
        </p>

        {user && (
          <div className={styles.userBadge}>
            {profile?.photoURL || user.photoURL ? (
              <img src={profile?.photoURL || user.photoURL} alt={user.displayName || 'Usuário'} />
            ) : null}
            <span>{profile?.displayName || user.displayName || user.email}</span>
          </div>
        )}

        {success ? (
          <div className={styles.successBox}>
            <CheckCircle size={48} color="#00ab00" />
            <p>Xbox autorizado com sucesso!</p>
            <span className={styles.subtitle}>
              O seu console já está conectado. Você pode fechar esta página.
            </span>
            <button className={styles.btnHome} onClick={() => navigate('/')}>
              Ir para a página inicial
            </button>
          </div>
        ) : (
          <form className={styles.codeForm} onSubmit={handleAuthorize}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Código do Console</label>
              <input
                className={styles.input}
                type="text"
                maxLength={8}
                placeholder="XB-1234"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.btnSubmit} type="submit" disabled={loading}>
              {loading ? 'Autorizando...' : user ? 'Autorizar Xbox' : 'Entrar para Autorizar'}
            </button>
          </form>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
