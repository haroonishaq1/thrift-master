import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import '../../styles/ForgotPasswordOtpVerification.css';

const BrandOtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const brandName = location.state?.brandName;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/brand/register/step1');
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
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
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
      console.log('Verifying Brand OTP:', otpCode, 'for email:', email);
      
      const response = await authAPI.brandVerifyOTP(email, otpCode);
      console.log('Brand OTP verification response:', response);

      if (response.success) {
        setSuccess('Verification successful! Redirecting...');
        
        // Navigate to login page
        setTimeout(() => {
          navigate('/brand/login', { 
            state: { 
              otpVerified: true,
              registrationComplete: true,
              email: email,
              brandName: brandName,
              message: 'Brand registration completed! Please wait for admin approval before logging in.'
            }
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Brand OTP verification error:', error);
      setError(error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const response = await authAPI.brandResendOTP(email);
      
      if (response.success) {
        setSuccess('New verification code sent to your email!');
        setResendCooldown(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        
        // Focus first input
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="forgot-password-otp-container">
      <div className="forgot-password-otp-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Brand Email Verification</h2>
        <p className="forgot-password-otp-description">
          We've sent a 6-digit verification code to {email}
          {brandName && (
            <>
              <br />
              <strong>Brand: {brandName}</strong>
            </>
          )}
        </p>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="forgot-password-otp-form">
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
            {isLoading ? 'Verifying...' : 'Verify Code'}
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
        
        <div className="forgot-password-otp-footer">
          <p><a href="/brand/register/step1">← Back to Registration</a></p>
        </div>
      </div>
    </div>
  );
};

export default BrandOtpVerification;
