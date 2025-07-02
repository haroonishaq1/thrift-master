import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isUserAuthenticated } from '../utils/auth';
import { authAPI } from '../services/api';
import '../styles/ChangePassword.css';

function ChangePassword({ isLoggedIn }) {
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
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.changePassword(values.newPassword);
      
      if (response.success) {
        setSuccess('Password changed successfully! Redirecting...');
        resetForm();
        
        // Redirect back to profile page after a short delay
        setTimeout(() => {
          navigate('/profile');
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
    <div className="change-password-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="change-password-content">
        <div className="change-password-header">
          <h2 className="change-password-title">Change Password</h2>
          <p className="change-password-subtitle">Enter your new password below</p>
        </div>

        <div className="change-password-form-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
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
              <Form className="change-password-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <Field 
                    id="newPassword"
                    type="password" 
                    name="newPassword"
                    className="form-input"
                    disabled={loading}
                    placeholder="Enter new password"
                  />
                  <ErrorMessage name="newPassword" component="div" className="field-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <Field 
                    id="confirmPassword"
                    type="password" 
                    name="confirmPassword"
                    className="form-input"
                    disabled={loading}
                    placeholder="Confirm new password"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="cancel-button"
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

      <Footer />
    </div>
  );
}

export default ChangePassword;
