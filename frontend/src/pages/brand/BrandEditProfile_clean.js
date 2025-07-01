import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getBrandData, isBrandAuthenticated, storeBrandAuth } from '../../utils/auth';
import { brandAPI } from '../../services/api';
import '../../styles/brand/BrandProfile.css';
import '../../styles/Login.css';

function BrandEditProfile() {
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Validation schema - only for editable fields
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Brand name is required')
      .min(2, 'Brand name must be at least 2 characters'),
    category: Yup.string()
      .required('Category is required'),
    phoneNumber: Yup.string()
      .min(10, 'Phone number must be at least 10 digits')
  });

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        // Check if brand is authenticated
        if (!isBrandAuthenticated()) {
          navigate('/brand/login');
          return;
        }

        // Fetch fresh brand data from API
        const response = await brandAPI.getBrandProfile();
        if (response.success) {
          setBrandData(response.data.brand);
        } else {
          setError('Failed to load brand data');
        }
      } catch (error) {
        console.error('Error fetching brand data:', error);
        setError('Failed to load brand data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBrandData();
  }, [navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API call - only send editable fields
      const updateData = {
        name: values.name,
        category: values.category,
        phoneNumber: values.phoneNumber || ''
      };

      console.log('Updating brand profile with:', updateData);

      const response = await brandAPI.updateBrandProfile(updateData);
      
      if (response.success) {
        // Update stored brand data
        const token = localStorage.getItem('brand-token');
        const updatedBrandData = { ...brandData, ...response.data.brand };
        storeBrandAuth(token, updatedBrandData);
        
        setSuccess('Profile updated successfully!');
        
        // Redirect back to profile page after a short delay
        setTimeout(() => {
          navigate('/brand/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Brand profile update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="brand-profile-container">
        <div className="loading">Loading brand data...</div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="brand-profile-container">
        <div className="loading">No brand data found</div>
      </div>
    );
  }

  return (
    <div className="brand-profile-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-popup">
            <div className="loading-spinner"></div>
            <p>Updating profile...</p>
          </div>
        </div>
      )}

      <div className="brand-profile-content">
        <div className="brand-profile-header">
          <div className="brand-profile-header-top">
            <h2 className="brand-profile-title">Edit Brand Profile</h2>
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
              name: brandData.name || '',
              category: brandData.category || '',
              phoneNumber: brandData.phone_number || brandData.phoneNumber || '',
              // Read-only fields for display
              email: brandData.email || '',
              website: brandData.website || '',
              registrationDate: brandData.created_at ? new Date(brandData.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A',
              status: brandData.is_approved ? 'Approved' : 'Pending Approval'
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="edit-profile-form">
                <div className="detail-section">
                  <h3 style={{ textAlign: 'left' }}>Brand Information</h3>
                  
                  <div className="detail-grid">
                    <div className="form-group">
                      <label htmlFor="name">Brand Name *</label>
                      <Field 
                        id="name"
                        type="text" 
                        name="name"
                        className="detail-value"
                        disabled={loading}
                      />
                      <ErrorMessage name="name" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <Field 
                        as="select"
                        id="category"
                        name="category"
                        className="detail-value"
                        disabled={loading}
                      >
                        <option value="">Select Category</option>
                        <option value="fashion">Fashion</option>
                        <option value="electronics">Electronics</option>
                        <option value="home">Home & Garden</option>
                        <option value="sports">Sports & Outdoors</option>
                        <option value="books">Books & Media</option>
                        <option value="beauty">Beauty & Personal Care</option>
                        <option value="food">Food & Beverages</option>
                        <option value="automotive">Automotive</option>
                        <option value="health">Health & Wellness</option>
                        <option value="toys">Toys & Games</option>
                        <option value="travel">Travel & Tourism</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </Field>
                      <ErrorMessage name="category" component="div" className="error-message" />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <PhoneInput
                        country={'pk'}
                        value={values.phoneNumber}
                        onChange={(phone) => setFieldValue('phoneNumber', phone)}
                        disabled={loading}
                        inputStyle={{
                          width: '100%',
                          padding: '12px 50px',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '1rem',
                          backgroundColor: loading ? '#f8f9fa' : 'white'
                        }}
                      />
                      <ErrorMessage name="phoneNumber" component="div" className="error-message" />
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
                      <label htmlFor="website">Website Domain</label>
                      <Field 
                        id="website"
                        type="text" 
                        name="website"
                        className="detail-value"
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                        Domain cannot be changed
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="registrationDate">Registration Date</label>
                      <Field 
                        id="registrationDate"
                        type="text" 
                        name="registrationDate"
                        className="detail-value"
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                        Registration date cannot be changed
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Approval Status</label>
                      <Field 
                        id="status"
                        type="text" 
                        name="status"
                        className="detail-value"
                        readOnly
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          cursor: 'not-allowed',
                          color: brandData.is_approved ? '#28a745' : '#ffc107',
                          fontWeight: 'bold'
                        }}
                      />
                      <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                        Status is managed by administrators
                      </small>
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
                    type="submit" 
                    className="login-button"
                    disabled={isSubmitting || loading}
                    style={{
                      padding: '12px 24px',
                      minWidth: '120px',
                      cursor: (isSubmitting || loading) ? 'not-allowed' : 'pointer',
                      opacity: (isSubmitting || loading) ? 0.6 : 1
                    }}
                  >
                    {isSubmitting || loading ? 'Updating...' : 'Update Profile'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => navigate('/brand/profile')}
                    className="back-button"
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid #ddd',
                      backgroundColor: 'white',
                      color: '#333',
                      borderRadius: '5px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      opacity: loading ? 0.6 : 1
                    }}
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

export default BrandEditProfile;
