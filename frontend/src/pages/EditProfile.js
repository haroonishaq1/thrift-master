import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUserData, isUserAuthenticated, storeUserAuth, getUserToken } from '../utils/auth';
import { authAPI } from '../services/api';
import '../styles/Profile.css';
import '../styles/Login.css';

function EditProfile({ isLoggedIn }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    username: Yup.string()
      .required('Username is required')
      .min(4, 'Username must be at least 4 characters'),
    age: Yup.number()
      .required('Age is required')
      .min(16, 'You must be at least 16 years old')
      .max(100, 'Age cannot be more than 100'),
    gender: Yup.string()
      .required('Gender is required'),
    phone: Yup.string()
      .required('Phone number is required'),
    country: Yup.string()
      .required('Country is required'),
    city: Yup.string()
      .required('City is required'),
    university: Yup.string()
      .required('University is required'),
    course: Yup.string()
      .required('Course/Program is required')
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data from localStorage
    const data = getUserData();
    if (data) {
      setUserData(data);
    }
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API call
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        age: parseInt(values.age),
        gender: values.gender,
        phone: values.phone,
        country: values.country,
        city: values.city,
        university: values.university,
        course: values.course
      };

      console.log('Sending update data:', updateData);
      console.log('Current userToken:', localStorage.getItem('userToken'));
      console.log('Current userData:', localStorage.getItem('userData'));

      const response = await authAPI.updateProfile(updateData);
      
      if (response.success) {
        // Update localStorage with the response data from backend
        const updatedUserData = response.data.user;
        storeUserAuth(getUserToken(), updatedUserData);
        
        setSuccess('Profile updated successfully!');
        setShowSuccessModal(true);
        
        // Redirect back to profile page after showing success modal
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/my-profile');
        }, 2500);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error details:', error.message);
      
      // Show more specific error message
      if (error.message.includes('Email verification required')) {
        setError('Email verification required. Please verify your email first.');
        setShowVerificationPrompt(true);
      } else if (error.message.includes('Authentication')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await authAPI.resendOTP(userData.email);
      setSuccess('Verification email sent! Please check your inbox and verify your email.');
      setShowVerificationPrompt(false);
      
      // Redirect to verification page or show instructions
      setTimeout(() => {
        alert('Please check your email and verify your account. You will need to log in again after verification.');
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <Header isLoggedIn={isLoggedIn} />
        <div className="loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-top">
            <h2 className="profile-title">Edit Profile</h2>
            <button 
              className="edit-button"
              onClick={() => navigate('/my-profile')}
              style={{
                backgroundColor: '#4361ee',
                borderColor: '#4361ee'
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="profile-details">
          {error && (
            <div className="login-error-message" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          {showVerificationPrompt && (
            <div className="verification-prompt" style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              padding: '15px', 
              borderRadius: '6px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 15px 0', color: '#856404' }}>
                Your email address needs to be verified before you can update your profile.
              </p>
              <button 
                onClick={handleResendVerification}
                disabled={loading}
                style={{
                  backgroundColor: '#4361ee',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
          
          {success && (
            <div className="success-message" style={{ marginBottom: '20px' }}>
              {success}
            </div>
          )}

          <Formik
            initialValues={{
              firstName: userData.first_name || userData.firstName || '',
              lastName: userData.last_name || userData.lastName || '',
              username: userData.username || '',
              email: userData.email || '',
              age: userData.age || '',
              gender: userData.gender || '',
              phone: userData.phone || '',
              country: userData.country || '',
              city: userData.city || '',
              university: userData.university || '',
              course: userData.course || userData.bio || ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="edit-profile-form">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  
                  <div className="detail-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <Field 
                        id="firstName"
                        type="text" 
                        name="firstName"
                        className="detail-value"
                      />
                      <ErrorMessage name="firstName" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <Field 
                        id="lastName"
                        type="text" 
                        name="lastName"
                        className="detail-value"
                      />
                      <ErrorMessage name="lastName" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <Field 
                        id="username"
                        type="text" 
                        name="username"
                        className="detail-value"
                      />
                      <ErrorMessage name="username" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <Field 
                        id="email"
                        type="email" 
                        name="email"
                        className="detail-value"
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                        Email cannot be changed
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="age">Age</label>
                      <Field 
                        id="age"
                        type="number" 
                        name="age"
                        min="16"
                        max="100"
                        className="detail-value"
                      />
                      <ErrorMessage name="age" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <Field 
                        as="select"
                        id="gender"
                        name="gender"
                        className="detail-value"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Field>
                      <ErrorMessage name="gender" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Contact Information</h3>
                  
                  <div className="detail-grid">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="phone">Phone Number</label>
                      <PhoneInput
                        country={'pk'}
                        value={values.phone}
                        onChange={(phone) => setFieldValue('phone', phone)}
                        inputStyle={{
                          width: '100%',
                          padding: '12px 50px',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                      <ErrorMessage name="phone" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Address & Education</h3>
                  
                  <div className="detail-grid">
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <Field 
                        id="country"
                        type="text" 
                        name="country"
                        className="detail-value"
                      />
                      <ErrorMessage name="country" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <Field 
                        id="city"
                        type="text" 
                        name="city"
                        className="detail-value"
                      />
                      <ErrorMessage name="city" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="university">University</label>
                      <Field 
                        id="university"
                        type="text" 
                        name="university"
                        className="detail-value"
                      />
                      <ErrorMessage name="university" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="course">Course/Program</label>
                      <Field 
                        id="course"
                        type="text" 
                        name="course"
                        className="detail-value"
                      />
                      <ErrorMessage name="course" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

                <div className="form-actions" style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  justifyContent: 'flex-end',
                  padding: '20px 0',
                  borderTop: '1px solid #e9ecef',
                  marginTop: '20px'
                }}>
                  <button 
                    type="button"
                    onClick={() => navigate('/my-profile')}
                    className="back-button"
                    style={{
                      padding: '12px 24px',
                      border: '1px solid #4361ee',
                      backgroundColor: 'white',
                      color: '#4361ee',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#4361ee';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.color = '#4361ee';
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    className="login-button"
                    disabled={isSubmitting || loading}
                    style={{
                      padding: '12px 24px',
                      minWidth: '120px',
                      opacity: (isSubmitting || loading) ? 0.7 : 1,
                      transform: (isSubmitting || loading) ? 'scale(0.98)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSubmitting || loading ? '' : 'Update Profile'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <div className="checkmark">
                <div className="checkmark-circle">
                  <div className="background"></div>
                  <div className="checkmark-draw"></div>
                </div>
              </div>
            </div>
            <h3>Profile Updated Successfully!</h3>
            <p>Your profile information has been updated.</p>
            <p className="redirect-text">Redirecting to profile page...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default EditProfile;
