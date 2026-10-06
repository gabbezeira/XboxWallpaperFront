import { useState, useEffect } from 'react';
import { Heart, X, Copy, Check } from 'lucide-react';
import styles from './styles.module.scss';

export default function SupportModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const pixKey = '9ac32acc-53f3-4695-ab9b-e4d4d22d9a37';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar chave', err);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Heart size={24} className={styles.headerIcon} />
          </div>
          <h3 className={styles.title}>Apoie o Projeto</h3>
          <p className={styles.desc}>
            Ajude a manter os servidores ativos e apoie o desenvolvimento contínuo do Spartan Wallpapers.
          </p>
        </div>

        <div className={styles.qrArea}>
          <img src="/pix-qrcode.png" alt="QR Code Pix" className={styles.qrImage} />
          <span className={styles.qrHint}>Escaneie com o app do seu banco.</span>
        </div>

        <div className={styles.keyArea}>
          <span className={styles.keyLabel}>Ou copie a Chave Aleatória:</span>
          <div className={styles.keyBox}>
            <code className={styles.keyValue}>{pixKey}</code>
            <button className={styles.copyBtn} onClick={handleCopy} aria-label="Copiar chave">
              {copied ? <Check size={18} className={styles.checkIcon} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
