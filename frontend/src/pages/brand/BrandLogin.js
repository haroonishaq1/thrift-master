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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
  
  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
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
    setError('');
    setIsLoading(true);
    
    // Validate fields and show custom errors
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setIsLoading(false);
      return;
    } else {
      setEmailError('');
    }
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      setIsLoading(false);
      return;
    } else {
      setPasswordError('');
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
      // Map the complete brand data properly
      const brandData = {
        id: data.data?.brand?.id,
        name: data.data?.brand?.name,
        email: data.data?.brand?.email,
        phone_number: data.data?.brand?.phone_number || data.data?.brand?.phoneNumber || data.data?.brand?.phone,
        website: data.data?.brand?.website || data.data?.brand?.websiteUrl,
        category: data.data?.brand?.category,
        description: data.data?.brand?.description,
        logo: data.data?.brand?.logo,
        status: data.data?.brand?.status,
        is_approved: data.data?.brand?.is_approved,
        created_at: data.data?.brand?.created_at,
        updated_at: data.data?.brand?.updated_at,
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
      // Show general error message for login failures
      setError('Invalid credentials');
      setEmailError('');
      setPasswordError('');
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
        <button 
          className="back-to-home-button" 
          onClick={() => navigate('/')}
          type="button"
        >
          ← Home
        </button>
        <h1>THRIFT</h1>        
        <h2>Brand Partner Login</h2>
        
        {error && (
          <div className="brand-login-error-message">
            {error}
          </div>
        )}
        
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="brand-login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your business email"
              disabled={isLoading}
            />
            {emailError && <div className="field-error">{emailError}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {passwordError && <div className="field-error">{passwordError}</div>}
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
