import { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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
        text: 'Link de confirmação enviado para o seu e-mail.',
      });
      setCooldown(60);
      setTimeout(() => setFeedback(null), 6000);
    } catch {
      setFeedback({
        type: 'warning',
        text: 'Aguarde antes de solicitar outro envio.',
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
          text: 'Ainda não confirmado. Acesse sua caixa de entrada e clique no link de confirmação.',
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
        <Icon size={14} className={styles.feedbackIcon} />
        <span className={styles.feedbackText}>{feedback.text}</span>
      </div>
    );
  };

  if (variant === 'mobile') {
    return (
      <aside className={styles.mobileContainer} role="alert">
        <div className={styles.mobileTopRow}>
          <div className={styles.mobileHeaderLeft}>
            <Mail size={15} className={styles.mobileIcon} />
            <span className={styles.mobileTitle}>Confirmação de e-mail</span>
          </div>
          {isExistingAccount && isWithinGrace ? (
            <span className={styles.badgeWarning}>
              <Clock size={11} />
              <span>{daysLeft}d restantes</span>
            </span>
          ) : (
            <span className={styles.badgeDanger}>Ação necessária</span>
          )}
        </div>

        <p className={styles.mobileDesc}>
          {isExistingAccount && isWithinGrace
            ? 'Confirme seu endereço para continuar publicando wallpapers após o período de carência.'
            : 'Confirme seu endereço para liberar o envio de wallpapers e recursos de criador.'}
        </p>

        {renderFeedback()}

        <div className={styles.mobileActions}>
          <button
            type="button"
            className={styles.btnCheck}
            onClick={handleCheckNow}
            disabled={checking}
          >
            {checking ? (
              <span className={styles.buttonSpinner} />
            ) : (
              <Check size={14} />
            )}
            <span>{checking ? 'Verificando...' : 'Já confirmei'}</span>
          </button>

          <button
            type="button"
            className={styles.btnResend}
            onClick={handleResend}
            disabled={loading || cooldown > 0}
          >
            {loading ? (
              <span className={styles.buttonSpinner} />
            ) : (
              <Mail size={14} />
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
      </aside>
    );
  }

  return (
    <div className={styles.sidebarContainer} role="alert">
      <div className={styles.sidebarHeader}>
        <div className={styles.iconBox}>
          <Mail size={16} />
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.headerTitleRow}>
            <span className={styles.sidebarTitle}>Confirme seu e-mail</span>
            {isExistingAccount && isWithinGrace ? (
              <span className={styles.badgeWarning}>
                <Clock size={11} />
                <span>{daysLeft}d</span>
              </span>
            ) : (
              <span className={styles.badgeDanger}>Pendente</span>
            )}
          </div>
          {user.email && (
            <span className={styles.targetEmail} title={user.email}>
              {user.email}
            </span>
          )}
        </div>
      </div>

      <p className={styles.sidebarDesc}>
        {isExistingAccount && isWithinGrace
          ? 'Confirme seu endereço para continuar publicando wallpapers após a carência.'
          : 'Confirme seu endereço para liberar uploads e coleções.'}
      </p>

      {renderFeedback()}

      <div className={styles.sidebarActions}>
        <button
          type="button"
          className={styles.btnCheck}
          onClick={handleCheckNow}
          disabled={checking}
        >
          {checking ? (
            <span className={styles.buttonSpinner} />
          ) : (
            <Check size={14} />
          )}
          <span>{checking ? 'Verificando...' : 'Já confirmei'}</span>
        </button>

        <button
          type="button"
          className={styles.btnResend}
          onClick={handleResend}
          disabled={loading || cooldown > 0}
        >
          {loading ? (
            <span className={styles.buttonSpinner} />
          ) : (
            <Mail size={14} />
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
    </div>
  );
}
