import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storeBrandAuth } from '../../utils/auth';
import { authAPI } from '../../services/api';
import '../../styles/brand/BrandLogin.css';

function BrandLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
    // Check if user came from successful registration or OTP verification
  useEffect(() => {
    const registrationSuccess = location.state?.registrationSuccess;
    const otpVerified = location.state?.otpVerified;
    const registrationComplete = location.state?.registrationComplete;
    const registeredEmail = location.state?.email;
    const brandName = location.state?.brandName;
    const message = location.state?.message;
    
    if (otpVerified && registrationComplete) {
      setSuccess(message || 'Email verified successfully! Your brand registration is complete. Please wait for admin approval before logging in.');
      setEmail(registeredEmail || '');
    } else if (registrationSuccess && registeredEmail) {
      setSuccess('Registration successful! Please log in with your credentials.');
      setEmail(registeredEmail);
    }
  }, [location]);
  
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
      // Call the backend API for brand login using API service
      const data = await authAPI.brandLogin(email, password);
      
      console.log('🔍 Brand login response:', data);
      console.log('🔍 Token from response:', data.data?.token);
      console.log('🔍 Brand from response:', data.data?.brand);
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and brand data to local storage using our utility function
      const brandData = {
        id: data.data?.brand?.id,
        name: data.data?.brand?.name,
        email: data.data?.brand?.email,
        verified: data.data?.brand?.verified,
        adminId: data.data?.brand?.adminId,
        adminUsername: data.data?.brand?.adminUsername,
        adminEmail: data.data?.brand?.adminEmail
      };
      
      console.log('🔍 Storing brand data:', brandData);
      console.log('🔍 Storing token:', data.data?.token);
      
      // Store auth data in local storage
      storeBrandAuth({
        token: data.data?.token,
        brand: brandData
      });
      
      // Verify storage immediately after
      const storedToken = localStorage.getItem('brand-token');
      const storedData = localStorage.getItem('brand-data');
      console.log('🔍 Verification - Stored token:', storedToken);
      console.log('🔍 Verification - Stored data:', storedData);
      
      // Show success message briefly before navigating
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/brand/analytics');
      }, 800);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = () => {
    // Navigate to brand forgot password page
    navigate('/brand/forgot-password');
  };
  
  return (
    <div className="brand-login-container">
      <div className="brand-login-form-wrapper">
        <h1>THRIFT</h1>        <h2>Brand Partner Login</h2>
        
        {success && <div className="success-message">{success}</div>}
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
