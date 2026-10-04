import { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
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
      setFeedback({
        type: 'success',
        text: 'Link de confirmação enviado para sua caixa de entrada.',
      });
      setCooldown(60);
      setTimeout(() => setFeedback(null), 6000);
    } catch {
      setFeedback({
        type: 'warning',
        text: 'Aguarde alguns instantes antes de reenviar.',
      });
      setCooldown(30);
      setTimeout(() => setFeedback(null), 5000);
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
        setFeedback({
          type: 'success',
          text: 'E-mail confirmado com sucesso!',
        });
      } else {
        setFeedback({
          type: 'warning',
          text: 'Ainda não confirmado. Clique no link que enviamos ao seu e-mail.',
        });
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Erro ao verificar status. Tente novamente em instantes.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setChecking(false);
    }
  };

  const renderFeedback = () => {
    if (!feedback) return null;
    const isSuccess = feedback.type === 'success';
    const isError = feedback.type === 'error';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;
    const alertClass = isSuccess
      ? styles.feedbackSuccess
      : isError
      ? styles.feedbackError
      : styles.feedbackWarning;

    return (
      <div className={`${styles.feedbackBox} ${alertClass}`} role="status">
        <Icon size={13} className={styles.feedbackIcon} />
        <span className={styles.feedbackText}>{feedback.text}</span>
      </div>
    );
  };

  if (variant === 'mobile') {
    return (
      <aside className={styles.mobileBanner} role="alert">
        <div className={styles.mobileTopRow}>
          <div className={styles.mobileHeaderLeft}>
            <Mail size={14} className={styles.mobileMailIcon} />
            <span className={styles.mobileTitle}>Confirmação de e-mail</span>
          </div>
          <span
            className={
              isExistingAccount && isWithinGrace
                ? styles.mobileGraceTag
                : styles.mobileUrgentTag
            }
          >
            {isExistingAccount && isWithinGrace
              ? `${daysLeft}d restantes`
              : 'Pendente'}
          </span>
        </div>

        <p className={styles.mobileDesc}>
          {isExistingAccount && isWithinGrace
            ? 'Confirme seu endereço para continuar publicando wallpapers.'
            : 'Confirme seu endereço para liberar o envio de novos wallpapers.'}
        </p>

        {renderFeedback()}

        <div className={styles.mobileActions}>
          <button
            type="button"
            className={styles.mobilePrimaryBtn}
            onClick={handleCheckNow}
            disabled={checking}
          >
            {checking ? <span className={styles.spinner} /> : <Check size={14} />}
            <span>{checking ? 'Verificando...' : 'Já confirmei'}</span>
          </button>

          <button
            type="button"
            className={styles.mobileSecondaryBtn}
            onClick={handleResend}
            disabled={loading || cooldown > 0}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <Mail size={13} />
            )}
            <span>
              {loading
                ? 'Enviando...'
                : cooldown > 0
                ? `${cooldown}s`
                : 'Reenviar'}
            </span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <div className={styles.sidebarCard} role="alert">
      <div className={styles.cardHeader}>
        <div className={styles.headerIcon}>
          <Mail size={15} />
        </div>
        <div className={styles.headerInfo}>
          <span
            className={
              isExistingAccount && isWithinGrace
                ? styles.kickerGrace
                : styles.kickerUrgent
            }
          >
            {isExistingAccount && isWithinGrace
              ? `${daysLeft} dias restantes`
              : 'Ação necessária'}
          </span>
          <h4 className={styles.cardTitle}>Confirme seu e-mail</h4>
          {user.email && (
            <span className={styles.cardEmail} title={user.email}>
              {user.email}
            </span>
          )}
        </div>
      </div>

      <p className={styles.cardDesc}>
        {isExistingAccount && isWithinGrace
          ? 'Confirme para manter acesso total a uploads e criação de coleções.'
          : 'Confirme seu endereço para liberar envios e coleções.'}
      </p>

      {renderFeedback()}

      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleCheckNow}
          disabled={checking}
        >
          {checking ? <span className={styles.spinner} /> : <Check size={14} />}
          <span>{checking ? 'Verificando...' : 'Já confirmei'}</span>
        </button>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={handleResend}
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <Mail size={13} />
          )}
          <span>
            {loading
              ? 'Enviando...'
              : cooldown > 0
              ? `Reenviar (${cooldown}s)`
              : 'Reenviar link'}
          </span>
        </button>
      </div>
    </div>
  );
}
