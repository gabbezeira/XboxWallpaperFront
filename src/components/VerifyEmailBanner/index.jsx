import { useState, useEffect } from 'react';
import { AlertTriangle, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resendVerificationEmail } from '../../services/auth';
import styles from './styles.module.scss';

export default function VerifyEmailBanner() {
  const { needsEmailVerification, user } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!needsEmailVerification || !user) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setFeedback(null);
    try {
      await resendVerificationEmail();
      setFeedback('Link de confirmação reenviado!');
      setCooldown(60);
    } catch {
      setFeedback('Aguarde antes de reenviar novamente.');
      setCooldown(30);
    } finally {
      setLoading(false);
    }
  };

  const CUTOFF_TS = Date.parse('2026-10-04T12:00:00Z');
  const GRACE_END_TS = Date.parse('2026-10-18T23:59:59Z');
  const userCreationTs = user?.metadata?.creationTime
    ? Date.parse(user.metadata.creationTime)
    : Date.now();
  const isExistingAccount = userCreationTs <= CUTOFF_TS;
  const isWithinGrace = Date.now() < GRACE_END_TS;
  const daysLeft = Math.max(
    0,
    Math.ceil((GRACE_END_TS - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.leftGroup}>
        <AlertTriangle size={18} className={styles.icon} />
        <p className={styles.text}>
          {isExistingAccount && isWithinGrace ? (
            <>
              <strong>Confirmação pendente:</strong> Verifique seu email ({user.email}). Você tem {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} de carência antes do bloqueio de envios.
            </>
          ) : (
            <>
              <strong>Confirmação obrigatória:</strong> Verifique seu email ({user.email}) para desbloquear envios e coleções.
            </>
          )}
        </p>
      </div>

      <div className={styles.rightGroup}>
        {feedback && <span className={styles.feedback}>{feedback}</span>}
        <button
          type="button"
          className={styles.btnAction}
          onClick={handleResend}
          disabled={loading || cooldown > 0}
        >
          {loading
            ? 'Enviando...'
            : cooldown > 0
            ? `Reenviar (${cooldown}s)`
            : 'Reenviar link'}
        </button>
      </div>
    </div>
  );
}
