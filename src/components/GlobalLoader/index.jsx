import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './styles.module.scss';

export default function GlobalLoader() {
  const { loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(
    () => sessionStorage.getItem('oauth_redirect') === 'true',
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isRedirecting && !hasError) {
      timeoutId = setTimeout(() => {
        setHasError(true);
        sessionStorage.removeItem('oauth_redirect');
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [isRedirecting, hasError]);

  useEffect(() => {
    if (!loading && isRedirecting && !hasError) {
      setIsRedirecting(false);
      sessionStorage.removeItem('oauth_redirect');
    }
  }, [loading, isRedirecting, hasError]);

  if (!isRedirecting && !hasError) return null;

  return (
    <div className={styles.overlay}>
      {hasError ? (
        <>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Tempo de conexão expirado</h2>
          <p className={styles.errorText}>
            Não foi possível completar o redirecionamento. Verifique sua conexão e tente novamente.
          </p>
          <button
            className={styles.backButton}
            onClick={() => {
              setHasError(false);
              setIsRedirecting(false);
            }}
          >
            Voltar para o app
          </button>
        </>
      ) : (
        <>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Conectando conta Microsoft...</p>
        </>
      )}
    </div>
  );
}
