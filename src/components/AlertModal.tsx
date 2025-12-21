import React, { FC } from 'react';
import '../styles/AlertModal.css';

export interface AlertAction {
  label: string;
  type?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

export interface AlertModalProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose: () => void;
  actions?: AlertAction[];
}

/**
 * Alert Modal Component
 * Menampilkan modal dialog dengan icon, title, message, dan actions
 */
const AlertModal: FC<AlertModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  onClose,
  actions = [],
}) => {
  if (!isOpen) return null;

  /**
   * Get icon berdasarkan type
   */
  const getIcon = (): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  /**
   * Handle backdrop click untuk close modal
   */
  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ): void => {
    if ((e.target as HTMLDivElement).className === 'alert-modal-backdrop') {
      onClose();
    }
  };

  return (
    <div className="alert-modal-backdrop" onClick={handleBackdropClick}>
      <div className={`alert-modal alert-modal-${type}`}>
        <div className="alert-modal-icon">{getIcon()}</div>

        <div className="alert-modal-content">
          {title && <h2 className="alert-modal-title">{title}</h2>}
          <p className="alert-modal-message">{message}</p>
        </div>

        <div className="alert-modal-actions">
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <button
                key={index}
                className={`alert-modal-btn alert-modal-btn-${
                  action.type || 'primary'
                }`}
                onClick={() => {
                  action.onClick?.();
                  onClose();
                }}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button
              className="alert-modal-btn alert-modal-btn-primary"
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
