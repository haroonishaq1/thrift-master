import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { storeBrandAuth } from '../../utils/auth';
import { authAPI } from '../../services/api';
import 'react-phone-input-2/lib/style.css';
import '../../styles/brand/BrandRegister.css';

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
  
  // Step 2 validation schema
  const validationSchema = Yup.object({
    country: Yup.string()
      .required('Country is required')
      .oneOf(['pk'], 'Only Pakistan is available'),    websiteUrl: Yup.string()
      .required('Website URL is required')
      .matches(
        websiteUrlRegex, 
        'Please enter a valid URL format that ends with .com'
      ),
    companyEmail: Yup.string()
      .required('Company email is required')
      .email('Please enter a valid email')
      .test('email-domain-match', 'Email domain must match website domain', function(value) {
        const { websiteUrl } = this.parent;
        if (!value || !websiteUrl) return true;
        
        try {
          // Extract domain from email (after @ symbol)
          const emailDomain = value.split('@')[1];
          
          // Extract domain from website URL
          let websiteDomain = websiteUrl;
          
          // Remove protocol if exists
          if (websiteDomain.startsWith('http://')) {
            websiteDomain = websiteDomain.substring(7);
          } else if (websiteDomain.startsWith('https://')) {
            websiteDomain = websiteDomain.substring(8);
          }
          
          // Remove www. if exists
          if (websiteDomain.startsWith('www.')) {
            websiteDomain = websiteDomain.substring(4);
          }
          
          return emailDomain === websiteDomain;
        } catch (e) {
          return false;
        }
      }),
    phone: Yup.string()
      .required('Phone number is required')
      .test('is-pak', 'Only Pakistan (+92) phone numbers are allowed', value => {
        return value && value.startsWith('92');
      }),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password')], 'Passwords do not match'),
    agreeTerms: Yup.boolean()
      .required('You must agree to the terms and conditions')
      .oneOf([true], 'You must agree to the terms and conditions')
  });
    
  const handleSubmit = async (values) => {
    try {
      setIsRegistering(true);
      setRegistrationStatus('Submitting your registration...');
      setRegistrationError('');
      
      // Combine data from step 1 and step 2
      const brandData = {
        ...step1Data,
        ...values
      };
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', brandData.brandName);
      formData.append('email', brandData.companyEmail);
      formData.append('password', brandData.password);
      formData.append('description', ''); // Optional field
      formData.append('website', brandData.websiteUrl);
      formData.append('adminUsername', brandData.adminUsername);
      formData.append('category', brandData.category);
      formData.append('country', brandData.country);
      formData.append('phoneNumber', brandData.phone);
      
      // Add logo file if it exists
      if (brandData.logoImage && brandData.logoImage instanceof File) {
        formData.append('logoImage', brandData.logoImage);
      }
      
      setRegistrationStatus('Connecting to server...');
      
      // Call the backend API to register brand using FormData
      const data = await authAPI.brandRegisterWithFormData(formData);
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
              email: data.data?.email || brandData.companyEmail,
              brandName: data.data?.brandName || brandData.brandName,
              message: data.message
            }
          });
        }, 1500);
      } else {
        // Old direct registration flow (fallback)
        setRegistrationStatus('Registration successful! Redirecting to login page...');

        setTimeout(() => {
          navigate('/brand/login', { 
            state: { 
              registrationSuccess: true,
              email: data.data?.brand?.email || brandData.companyEmail
            }
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Country options (only Pakistan)
  const countries = [
    { value: '', label: 'Select a country' },
    { value: 'pk', label: 'Pakistan' }
  ];
  
  return (
    <div className="brand-register-container">
      <div className="brand-register-form-wrapper">
        <h1>THRIFT</h1>
        <h2>Complete Your Brand Registration</h2>
        <p className="brand-register-step">Step 2 of 2</p>
        
        {registrationStatus && !registrationError && (
          <div className="registration-status success">{registrationStatus}</div>
        )}
        
        {registrationError && (
          <div className="registration-status error">{registrationError}</div>
        )}
        
        <Formik
          initialValues={{
            country: '',
            websiteUrl: '',
            companyEmail: '',
            phone: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="brand-register-form">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <Field 
                  as="select"
                  id="country" 
                  name="country" 
                >
                  {countries.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>

                <ErrorMessage name="country" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="websiteUrl">Website URL</label>                <Field 
                  id="websiteUrl" 
                  name="websiteUrl" 
                  type="text" 
                  placeholder="Enter your website URL"
                />
                <ErrorMessage name="websiteUrl" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="companyEmail">Company Email</label>                <Field 
                  id="companyEmail" 
                  name="companyEmail" 
                  type="email" 
                  placeholder="Enter company email"
                />

                <ErrorMessage name="companyEmail" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <PhoneInput
                  country={'pk'}
                  value={phoneNumber}
                  onChange={phone => {
                    setPhoneNumber(phone);
                    setFieldValue('phone', phone);
                  }}
                  onlyCountries={['pk']}
                  inputProps={{
                    name: 'phone',
                    id: 'phone',
                    required: true,
                  }}
                />

                <ErrorMessage name="phone" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="Create a password"
                />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <Field 
                    type="checkbox" 
                    name="agreeTerms" 
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    I agree to the <a href="/terms" target="_blank">Terms and Conditions</a>
                  </span>
                </label>
                <ErrorMessage name="agreeTerms" component="div" className="error-message" />
              </div>
              
              <div className="form-group submit-group">
                <button 
                  type="submit" 
                  className="brand-register-button"
                  disabled={isRegistering || isSubmitting}
                >
                  {isRegistering ? 'Registering...' : 'Register Brand'}
                </button>
                
                <button 
                  type="button" 
                  className="brand-register-button back-button"
                  onClick={() => navigate('/brand/register/step1')}
                  disabled={isRegistering || isSubmitting}
                >
                  Back
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default BrandRegisterStep2;
