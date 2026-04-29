import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.scss';

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}) {
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

  const confirmClass = variant === 'success' ? styles.btnSuccess : styles.btnConfirm;

  return createPortal(
    <div className={styles.overlay} onClick={onCancel || onConfirm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <p className={styles.content}>{message}</p>
        <div className={styles.actions}>
          {onCancel && (
            <button className={styles.btnCancel} onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={confirmClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
