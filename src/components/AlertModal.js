import React from 'react';
import '../styles/AlertModal.css';

const AlertModal = ({ isOpen, type = 'info', title, message, onClose, actions = [] }) => {
  if (!isOpen) return null;

  const getIcon = () => {
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

  const handleBackdropClick = (e) => {
    if (e.target.className === 'alert-modal-backdrop') {
      onClose();
    }
  };

  return (
    <div className="alert-modal-backdrop" onClick={handleBackdropClick}>
      <div className={`alert-modal alert-modal-${type}`}>
        <div className="alert-modal-icon">
          {getIcon()}
        </div>
        
        <div className="alert-modal-content">
          {title && <h2 className="alert-modal-title">{title}</h2>}
          <p className="alert-modal-message">{message}</p>
        </div>

        <div className="alert-modal-actions">
          {actions.length > 0 ? (
            actions.map((action, index) => (
              <button
                key={index}
                className={`alert-modal-btn alert-modal-btn-${action.type || 'primary'}`}
                onClick={() => {
                  action.onClick?.();
                  onClose();
                }}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button className="alert-modal-btn alert-modal-btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
