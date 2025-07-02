import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { isBrandAuthenticated } from '../../utils/auth';
import { brandAPI } from '../../services/api';
import '../../styles/brand/BrandProfile.css';
import '../../styles/ChangePassword.css';

function BrandChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
  });

  useEffect(() => {
    // Check if brand is authenticated
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
      return;
    }
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await brandAPI.changePassword(values.newPassword);
      
      if (response.success) {
        setSuccess('Password changed successfully! Redirecting...');
        resetForm();
        
        // Redirect back to profile page after a short delay
        setTimeout(() => {
          navigate('/brand/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="brand-profile-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-popup">
            <div>Loading...</div>
            <p>Changing password...</p>
          </div>
        </div>
      )}

      <div className="brand-profile-content">
        <div className="brand-profile-header">
          <div className="brand-profile-header-top">
            <h2 className="brand-profile-title" style={{ marginTop: '20px' }}>Change Password</h2>
            <p className="change-password-subtitle">Enter your new password below</p>
          </div>
        </div>

        <div className="brand-profile-details">
          {error && (
            <div className="login-error-message" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message" style={{ 
              marginBottom: '20px', 
              color: '#28a745', 
              padding: '10px', 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb', 
              borderRadius: '5px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {success}
            </div>
          )}

          <Formik
            initialValues={{
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="edit-profile-form">
                <div className="detail-section">
                  <h3 style={{ textAlign: 'left' }}>New Password</h3>
                  
                  <div className="detail-grid">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="newPassword">New Password *</label>
                      <Field 
                        id="newPassword"
                        type="password" 
                        name="newPassword"
                        className="detail-value"
                        disabled={loading}
                        placeholder="Enter new password"
                      />
                      <ErrorMessage name="newPassword" component="div" className="error-message" />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="confirmPassword">Confirm Password *</label>
                      <Field 
                        id="confirmPassword"
                        type="password" 
                        name="confirmPassword"
                        className="detail-value"
                        disabled={loading}
                        placeholder="Confirm new password"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="login-button"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => navigate('/brand/profile')}
                    className="back-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default BrandChangePassword;
