import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/brand/BrandLogin.css';

function BrandLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
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
      // Call the backend API for brand login
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/brand-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save token and brand data to local storage
      localStorage.setItem('brand-token', data.data?.token);
      
      // Save brand data including admin info if available
      localStorage.setItem('brand-data', JSON.stringify({
        id: data.data?.brand?.id,
        name: data.data?.brand?.name,
        email: data.data?.brand?.email,
        verified: data.data?.brand?.verified,
        adminId: data.data?.brand?.adminId,
        adminUsername: data.data?.brand?.adminUsername,
        adminEmail: data.data?.brand?.adminEmail
      }));
      
      // Navigate to dashboard
      navigate('/brand/analytics');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    // Navigate to forgot password page or trigger a modal
    console.log('Forgot password clicked');
  };
  
  return (
    <div className="brand-login-container">
      <div className="brand-login-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Brand Partner Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="brand-login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your business email"
              disabled={isLoading}
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
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
            <div className="forgot-password">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        
        <div className="brand-login-footer">
          <p>Don't have an account? <a href="/brand/register/step1">Register your brand</a></p>
        </div>
      </div>
    </div>
  );
}

export default BrandLogin;
