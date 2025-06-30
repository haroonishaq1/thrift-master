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
  const navigate = useNavigate();
  const location = useLocation();

  // Check for messages from forgot password flow
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      setEmail(location.state.email || '');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
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
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">      <div className="login-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Log in to Thrift with me</h2>
        
        {error && (
          <div className="error-message" style={{ 
            color: '#e74c3c', 
            backgroundColor: '#ffebee', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message" style={{ 
            color: '#2ecc71', 
            backgroundColor: '#e8f5e9', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
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
