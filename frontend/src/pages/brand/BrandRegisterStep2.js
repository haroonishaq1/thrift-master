import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import { storeBrandAuth } from '../../utils/auth';
import { authAPI } from '../../services/api';
import 'react-phone-input-2/lib/style.css';
import '../../styles/brand/BrandRegister.css';

// Brand registration step indicator component
const StepIndicator = ({ currentStep }) => {
  return (
    <div className="step-indicator">
      <div className={`step ${currentStep === 1 ? 'active' : 'completed'}`}>1</div>
      <div className="step-separator"></div>
      <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2</div>
    </div>
  );
};

function BrandRegisterStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData: step1Data } = location.state || {};
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [formData, setFormData] = useState({
    country: '',
    websiteUrl: '',
    companyEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  
  // Redirect to step 1 if no data was passed
  if (!step1Data) {
    navigate('/brand/register/step1');
    return null;
  }

  const countries = [
    { value: '', label: 'Select a country' },
    { value: 'pk', label: 'Pakistan' }
  ];
  
  // Simple validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.websiteUrl) {
      newErrors.websiteUrl = 'Website URL is required';
    } else if (!formData.websiteUrl.endsWith('.com')) {
      newErrors.websiteUrl = 'Website URL must end with .com';
    }
    
    if (!formData.companyEmail) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email';
    }
    
    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove all non-numeric characters except +
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      // Check Pakistani phone number format
      let isValid = false;
      
      if (cleanNumber.startsWith('+92')) {
        // +92 + 10 digits = 13 total characters
        isValid = cleanNumber.length === 13;
      } else if (cleanNumber.startsWith('92')) {
        // 92 + 10 digits = 12 total characters  
        isValid = cleanNumber.length === 12;
      } else {
        // For other formats, should be exactly 11 digits
        isValid = cleanNumber.length === 11;
      }
      
      if (!isValid) {
        newErrors.phone = 'Phone number must be 11 digits (Pakistani format: +92xxxxxxxxxx)';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsRegistering(true);
      setRegistrationStatus('Submitting your registration...');
      setRegistrationError('');
      
      // Combine step 1 and step 2 data
      const brandData = { ...step1Data, ...formData, phone: phoneNumber };
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', brandData.brandName);
      formDataToSend.append('email', brandData.companyEmail);
      formDataToSend.append('password', brandData.password);
      formDataToSend.append('description', ''); // Optional field
      formDataToSend.append('website', brandData.websiteUrl);
      formDataToSend.append('adminUsername', brandData.adminUsername);
      formDataToSend.append('category', brandData.category);
      formDataToSend.append('country', brandData.country);
      formDataToSend.append('phoneNumber', brandData.phone);
      
      // Add logo file if it exists
      if (brandData.logoImage && brandData.logoImage instanceof File) {
        formDataToSend.append('logoImage', brandData.logoImage);
      }
      
      setRegistrationStatus('Connecting to server...');
      
      // Call the backend API to register brand using FormData
      const data = await authAPI.brandRegisterWithFormData(formDataToSend);
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Check if this is the new OTP flow
      if (data.message && (data.message.includes('verification code') || data.message.includes('OTP'))) {
        setRegistrationStatus('Registration initiated! Redirecting to verification page...');

        // Navigate to OTP verification page
        setTimeout(() => {
          navigate('/brand/verify-otp', { 
            state: { 
              brandId: data.brandId,
              email: brandData.companyEmail,
              message: data.message 
            } 
          });
        }, 2000);
        return;
      }

      // Old flow - direct registration success
      setRegistrationStatus('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/brand/auth/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error.message || 'Registration failed. Please try again.');
      setRegistrationStatus('');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="brand-register-container">
      <div className="brand-register-form-wrapper">
        <button 
          className="back-arrow-btn"
          onClick={() => navigate('/')}
          aria-label="Go back to home"
        >
          <FaArrowLeft />
        </button>
        <h1>ThriftHub</h1>
        
        <StepIndicator currentStep={2} />
        
        <h2>Complete Registration</h2>
        
        {registrationStatus && (
          <div className={`registration-status ${registrationError ? 'error' : 'success'}`}>
            {registrationError || registrationStatus}
          </div>
        )}
        
        <form className="brand-register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select 
              id="country" 
              name="country" 
              value={formData.country}
              onChange={handleInputChange}
            >
              {countries.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.country && <div className="error-message">{errors.country}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="websiteUrl">Website URL</label>
            <input 
              id="websiteUrl" 
              name="websiteUrl" 
              type="text" 
              placeholder="Enter your website URL"
              value={formData.websiteUrl}
              onChange={handleInputChange}
            />
            {errors.websiteUrl && <div className="error-message">{errors.websiteUrl}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="companyEmail">Company Email</label>
            <input 
              id="companyEmail" 
              name="companyEmail" 
              type="email" 
              placeholder="Enter your company email"
              value={formData.companyEmail}
              onChange={handleInputChange}
            />
            {errors.companyEmail && <div className="error-message">{errors.companyEmail}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <PhoneInput
              country={'pk'}
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="Enter phone number"
              countryCodeEditable={false}
              disableDropdown={true}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeTerms" 
                className="checkbox-input"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">
                I agree to the <a href="/terms" target="_blank">Terms and Conditions</a>
              </span>
            </label>
            {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
          </div>
          
          <div className="form-group submit-group">
            <button 
              type="submit" 
              className="brand-register-button"
              disabled={isRegistering}
            >
              {isRegistering ? 'Registering...' : 'Register Brand'}
            </button>
            
            <button 
              type="button" 
              className="brand-register-button back-button"
              onClick={() => navigate('/brand/register/step1')}
              disabled={isRegistering}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BrandRegisterStep2;
