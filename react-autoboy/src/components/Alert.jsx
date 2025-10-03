import React, { useEffect } from 'react';
import './Alert.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faTimesCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const Alert = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faTimesCircle;
      case 'warning':
        return faExclamationCircle;
      case 'info':
      default:
        return faInfoCircle;
    }
  };

  return (
    <div className={`custom-alert custom-alert-${type}`}>
      <div className="custom-alert-content">
        <FontAwesomeIcon icon={getIcon()} className="custom-alert-icon" />
        <p className="custom-alert-message">{message}</p>
        {onClose && (
          <button className="custom-alert-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
