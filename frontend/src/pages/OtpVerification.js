import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { storeUserAuth } from '../utils/auth';
import '../styles/OtpVerification.css';

const OtpVerification = ({ updateAuthStatus }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Verifying OTP:', otpCode, 'for email:', email);
      
      const response = await authAPI.verifyOTP(email, otpCode);
      
      if (response.success) {
        // Store authentication data using proper auth utilities
        if (response.data.token && response.data.user) {
          storeUserAuth(response.data.token, response.data.user);
          
          // Update authentication status in parent App component
          if (updateAuthStatus) {
            updateAuthStatus();
          }
          
          console.log('✅ User automatically logged in after OTP verification');
        }
        
        setSuccess('Account verified successfully! Redirecting...');
        
        // Success - redirect to home page
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: 'Account verified successfully! Welcome to Project Thrift.',
              type: 'success'
            }
          });
        }, 1500);
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    
    try {
      console.log('Resending OTP to:', email);
      
      const response = await authAPI.resendOTP(email);
      
      if (response.success) {
        setSuccess('A new OTP has been sent to your email address.');
        setResendCooldown(60); // 60 seconds cooldown
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Verify Your Email</h2>
        <p className="otp-verification-description">
          We've sent a 6-digit verification code to {email}. Please enter it below.
        </p>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="otp-verification-form">
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                maxLength="1"
                disabled={isLoading}
                required
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            className="verify-button"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || resendCooldown > 0}
            className="resend-button"
          >
            {isResending ? 'Sending...' : 
             resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>
        
        <div className="otp-verification-footer">
          <p><a href="/signup">← Back to Sign Up</a></p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
