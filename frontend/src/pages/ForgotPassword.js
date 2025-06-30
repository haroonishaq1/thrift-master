import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
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
    
    // Check if email is empty
    if (!email) {
      setError('Email is required');
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
      // Call the forgot password API
      const data = await authAPI.forgotPassword(email);
      
      if (data.success) {
        setSuccess('Password reset code sent! Redirecting...');
        
        // Navigate to OTP verification page after a brief delay
        setTimeout(() => {
          navigate('/forgot-password/verify-otp', { 
            state: { 
              email: email,
              message: 'Please enter the 6-digit code sent to your email to reset your password.'
            } 
          });
        }, 1500);
      }
    } catch (err) {
      // Show specific error for unregistered email
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setError('This email is not registered with us');
      } else {
        setError('This email is not registered with us');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Reset Password</h2>
        <p className="forgot-password-description">
          Enter your email address and we'll send you a code to reset your password.
        </p>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="forgot-password-error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              disabled={isLoading}
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
        
        <div className="forgot-password-footer">
          <p>Remember your password? <a href="/login">Back to Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
