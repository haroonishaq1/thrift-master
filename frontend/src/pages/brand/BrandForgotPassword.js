import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import '../../styles/brand/BrandForgotPassword.css';

function BrandForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      // Call the brand forgot password API
      const data = await authAPI.brandForgotPassword(email);
      
      if (data.success) {
        setSuccess('Password reset code sent! Redirecting...');
        
        // Navigate to OTP verification page after a brief delay
        setTimeout(() => {
          navigate('/brand/forgot-password/verify-otp', { 
            state: { 
              email: email,
              message: 'Please enter the 6-digit code sent to your email to reset your brand password.'
            } 
          });
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="brand-forgot-password-container">
      <div className="brand-forgot-password-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Reset Brand Password</h2>
        <p className="brand-forgot-password-description">
          Enter your brand email address and we'll send you a code to reset your password.
        </p>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="brand-forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Brand Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your brand email"
              disabled={isLoading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="send-code-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
        
        <div className="brand-forgot-password-footer">
          <p>Remember your password? <a href="/brand/login">Back to Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default BrandForgotPassword;
