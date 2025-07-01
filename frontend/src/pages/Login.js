import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, tokenUtils } from '../services/api';
import { storeUserAuth } from '../utils/auth';
import '../styles/Login.css';

function Login({ updateAuthStatus }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for messages from forgot password flow
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      setEmail(location.state.email || '');
    }
  }, [location]);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please provide a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Clear field errors when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields and show custom errors
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError('');
      return;
    } else {
      setEmailError('');
    }
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      setError('');
      return;
    } else {
      setPasswordError('');
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Login attempt', { email, password });
      const response = await authAPI.login(email, password);
        if (response.success) {
        // Store the token and user data using auth utilities
        storeUserAuth(response.data.token, response.data.user);
        
        console.log('Login successful:', response.data.user);
        
        // Update authentication status in parent component
        if (updateAuthStatus) {
          updateAuthStatus();
        }
        
        // Redirect to home page or dashboard
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Show general error message for login failures
      setError('Invalid credentials');
      setEmailError('');
      setPasswordError('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="back-arrow" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>THRIFT</h1>
        <h2>Log in to Thrift with me</h2>
        
        {error && (
          <div className="login-error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
            />
            <div className="forgot-password">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="form-footer">
          <p>Don't have an account? <a href="/signup">Join Now</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
