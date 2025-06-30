import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isUserAuthenticated } from '../utils/auth';
import '../styles/Profile.css';

function Help({ isLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="profile-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1>Help & Support</h1>
          <p>Find answers to common questions</p>
        </div>

        <div className="help-content">
          <div className="help-section">
            <h3>Frequently Asked Questions</h3>
            
            <div className="faq-item">
              <h4>How do I redeem an offer?</h4>
              <p>Browse through our offers, click on the one you want, and follow the redemption instructions.</p>
            </div>
            
            <div className="faq-item">
              <h4>How do I reset my password?</h4>
              <p>Go to the login page and click "Forgot Password" to receive a reset link via email.</p>
            </div>
            
            <div className="faq-item">
              <h4>How do I contact customer support?</h4>
              <p>Email us at support@thrift.com or use the contact form below.</p>
            </div>
          </div>

          <div className="help-section">
            <h3>Contact Support</h3>
            <div className="contact-info">
              <p><strong>Email:</strong> support@thrift.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Help;