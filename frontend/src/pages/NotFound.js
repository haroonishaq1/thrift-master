import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <Header />
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          <div className="error-actions">
            <button 
              className="btn-primary" 
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
          <div className="helpful-links">
            <h3>Popular Pages:</h3>
            <ul>
              <li><a href="/" onClick={(e) => {e.preventDefault(); navigate('/')}}>Home</a></li>
              <li><a href="/offers" onClick={(e) => {e.preventDefault(); navigate('/offers')}}>All Offers</a></li>
              <li><a href="/contact" onClick={(e) => {e.preventDefault(); navigate('/contact')}}>Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="error-illustration">
          <div className="illustration-404">
            <div className="number-4 left">4</div>
            <div className="number-0">
              <div className="search-icon">🔍</div>
            </div>
            <div className="number-4 right">4</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NotFound;
