import { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resendVerificationEmail } from '../../services/auth';
import styles from './styles.module.scss';

export default function VerifyEmailBanner({ variant = 'sidebar' }) {
  const { needsEmailVerification, user, refreshProfile } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
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

  const handleResend = async (e) => {
    e.stopPropagation();
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setFeedback(null);
    try {
      await resendVerificationEmail();
      setFeedback('Link enviado!');
      setCooldown(60);
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback('Aguarde antes de reenviar');
      setCooldown(30);
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async (e) => {
    e.stopPropagation();
    if (checking) return;
    setChecking(true);
    setFeedback(null);
    try {
      await user.reload();
      if (user.emailVerified) {
        await user.getIdToken(true);
        await refreshProfile();
      } else {
        setFeedback('Ainda não confirmado');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback('Erro ao checar');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setChecking(false);
    }
  };

  if (variant === 'mobile') {
    return (
      <aside className={styles.mobileRibbon} role="alert">
        <div className={styles.ribbonLeft}>
          <span className={styles.ribbonPulse} />
          <span className={styles.ribbonText}>
            {isExistingAccount && isWithinGrace
              ? `Confirme seu email (${daysLeft}d restantes)`
              : 'Confirme seu email para liberar envios'}
          </span>
        </div>

        <div className={styles.ribbonRight}>
          {feedback && <span className={styles.ribbonFeedback}>{feedback}</span>}
          <button
            type="button"
            className={styles.ribbonBtn}
            onClick={handleResend}
            disabled={loading || cooldown > 0}
          >
            {loading ? '...' : cooldown > 0 ? `${cooldown}s` : 'Reenviar'}
          </button>
          <button
            type="button"
            className={styles.ribbonCheckBtn}
            onClick={handleCheckNow}
            disabled={checking}
            title="Já confirmei"
            aria-label="Já confirmei"
          >
            {checking ? <span className={styles.microSpinner} /> : <Check size={13} />}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <div className={styles.sidebarCard} role="alert">
      <div className={styles.cardHeader}>
        <div className={styles.iconBadge}>
          <Mail size={14} />
        </div>
        <div className={styles.titleCol}>
          <span className={styles.cardTitle}>Verificação pendente</span>
          {isExistingAccount && isWithinGrace ? (
            <span className={styles.graceTag}>{daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}</span>
          ) : (
            <span className={styles.urgentTag}>Ação necessária</span>
          )}
        </div>
      </div>

      <p className={styles.cardDesc}>
        {isExistingAccount && isWithinGrace
          ? 'Confirme seu email para continuar publicando e gerenciando coleções.'
          : 'Confirme seu email para desbloquear envios e coleções.'}
      </p>

      {feedback && <div className={styles.feedbackMsg}>{feedback}</div>}

      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.btnResend}
          onClick={handleResend}
          disabled={loading || cooldown > 0}
        >
          {loading
            ? 'Enviando...'
            : cooldown > 0
            ? `Reenviar (${cooldown}s)`
            : 'Reenviar link'}
        </button>
        <button
          type="button"
          className={styles.btnCheck}
          onClick={handleCheckNow}
          disabled={checking}
          title="Verificar agora"
        >
          {checking ? 'Checando...' : 'Já confirmei'}
        </button>
      </div>
    </div>
  );
}
