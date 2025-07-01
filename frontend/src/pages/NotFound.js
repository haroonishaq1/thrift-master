import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="error-container">
        <div className="error-content">
          <div className="error-visual">
            <div className="error-number">
              <span className="digit">4</span>
              <div className="middle-section">
                <div className="planet">
                  <div className="crater crater-1"></div>
                  <div className="crater crater-2"></div>
                  <div className="crater crater-3"></div>
                </div>
              </div>
              <span className="digit">4</span>
            </div>
          </div>
          
          <div className="error-text">
            <h1>Oops! Page Not Found</h1>
            <p>The page you're looking for seems to have wandered off into space.</p>
            <p className="sub-text">Don't worry, even the best explorers get lost sometimes.</p>
          </div>
          
          <div className="error-actions">
            <button 
              className="primary-btn"
              onClick={() => navigate('/')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              Back to Home
            </button>
            <button 
              className="secondary-btn"
              onClick={() => navigate(-1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
