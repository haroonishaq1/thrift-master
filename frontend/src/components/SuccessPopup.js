import React from 'react';
import './SuccessPopup.css';

function SuccessPopup({ isVisible, message, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-content">
          <div className="popup-icon">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>
          <div className="popup-message">
            <h3>Message Sent!</h3>
            <p>{message}</p>
          </div>
          <button className="popup-close-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPopup;
