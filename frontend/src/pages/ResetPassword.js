import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  // Redirect if no email or token provided
  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/forgot-password');
    }
  }, [email, resetToken, navigate]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    
    return {
      isValid: minLength,
      errors: {
        minLength
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Password strength validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet the requirements');
      setIsLoading(false);
      return;
    }
    
    try {
      const data = await authAPI.resetPassword(email, resetToken, password);
      
      if (data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        
        // Navigate to login page after success
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please log in with your new password.',
              email: email
            } 
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !resetToken) {
    return null; // Will redirect in useEffect
  }

  const passwordValidation = validatePassword(password);

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Create New Password</h2>
        <p className="reset-password-description">
          Enter your new password for {email}
        </p>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="password-input-wrapper">
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isLoading}
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {password && (
              <div className="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul>
                  <li className={passwordValidation.errors.minLength ? 'valid' : 'invalid'}>
                    At least 8 characters
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input 
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={isLoading}
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {confirmPassword && password !== confirmPassword && (
              <p className="password-mismatch">Passwords do not match</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="reset-button"
            disabled={isLoading || !passwordValidation.isValid || password !== confirmPassword}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="reset-password-footer">
          <p><a href="/login">← Back to Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
