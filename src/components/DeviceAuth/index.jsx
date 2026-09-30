import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../services/api';
import { loginWithCustomToken } from '../../services/auth';
import styles from './styles.module.scss';

export default function DeviceAuth({ onSuccess }) {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const isMountedRef = useRef(true);

  const fetchDeviceCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setExpired(false);
      const data = await api.deviceAuth.request();
      if (!isMountedRef.current) return;
      setDeviceData(data);
      const secondsLeft = Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000));
      setTimeLeft(secondsLeft);
    } catch (err) {
      if (isMountedRef.current) {
        setError('Erro ao gerar QR Code. Tente novamente.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDeviceCode();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDeviceCode]);

  useEffect(() => {
    if (!deviceData || expired) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [deviceData, expired]);

  useEffect(() => {
    if (!deviceData || expired) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await api.deviceAuth.poll(deviceData.deviceCode);
        if (!isMountedRef.current) return;

        if (res.status === 'authorized' && res.customToken) {
          clearInterval(pollInterval);
          await loginWithCustomToken(res.customToken);
          if (onSuccess) onSuccess();
        } else if (res.status === 'expired') {
          clearInterval(pollInterval);
          setExpired(true);
        }
      } catch {
      }
    }, deviceData.interval || 3000);

    return () => clearInterval(pollInterval);
  }, [deviceData, expired, onSuccess]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner} />
        <p className={styles.instructions}>Gerando código de conexão...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button className={styles.btnRefresh} onClick={fetchDeviceCode}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (expired) {
    return (
      <div className={styles.expiredContainer}>
        <p className={styles.error}>O código expirou.</p>
        <button className={styles.btnRefresh} onClick={fetchDeviceCode}>
          Gerar novo código
        </button>
      </div>
    );
  }

  const qrUrl = `${deviceData.verificationUri}?code=${deviceData.userCode}`;

  return (
    <div className={styles.container}>
      <div className={styles.qrWrapper}>
        <QRCodeSVG value={qrUrl} size={150} />
      </div>

      <div className={styles.codeContainer}>
        <span className={styles.codeLabel}>Código de Conexão</span>
        <span className={styles.codeValue}>{deviceData.userCode}</span>
      </div>

      <p className={styles.instructions}>
        Escaneie o <strong>QR Code</strong> pelo celular ou acesse <strong>{deviceData.verificationUri}</strong> para conectar sua conta.
      </p>

      <div className={styles.statusMessage}>
        <div className={styles.spinner} />
        <span>Aguardando autorização no celular...</span>
      </div>

      <span className={styles.timer}>Expira em {formatTime(timeLeft)}</span>
    </div>
  );
}
