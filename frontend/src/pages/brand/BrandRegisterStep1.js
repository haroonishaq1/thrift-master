import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
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

function BrandRegisterStep1() {
  const navigate = useNavigate();
  const [filePreview, setFilePreview] = useState(null);
  const [registrationError, setRegistrationError] = useState('');
  
  // First step of brand registration validation schema
  const validationSchema = Yup.object({
    brandName: Yup.string()
      .required('Brand name is required')
      .min(1, 'Brand name must be at least 1 character')
      .max(15, 'Brand name must not exceed 15 characters')
      .matches(/^[a-zA-Z0-9]+$/, 'Brand name can only contain letters and numbers'),
    adminUsername: Yup.string()
      .required('Admin username is required')
      .min(4, 'Username must be at least 4 characters')
      .max(12, 'Username must not exceed 12 characters')
      .matches(/^[a-zA-Z0-9]+$/, 'Admin username can only contain letters and numbers'),
    logoImage: Yup.mixed()
      .required('Brand logo is required')
      .test('fileFormat', 'Only .png, .jpg, .jpeg, .webp, and .svg files are accepted', value => {
        if (!value) return true;
        return ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(value.type);
      }),
    category: Yup.string()
      .required('Please select a category'),
  });
  
  const handleFileChange = async (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    
    if (file) {
      // Check if file is one of the allowed types
      if (['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
          setFieldValue('logoImage', undefined);
          setRegistrationError('Logo size exceeds 2MB. Please choose a smaller file.');
          return;
        }
        
        setRegistrationError('');
        setFieldValue('logoImage', file);
        
        // Create a preview for the image
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the input and set field error
        event.target.value = null;
        setFieldValue('logoImage', undefined);
        setFieldValue('logoImage', undefined, { validationMessage: 'Only .png, .jpg, .jpeg, .webp, and .svg files are accepted' });
      }
    }
  };
  
  const handleRemoveLogo = (setFieldValue) => {
    setFieldValue('logoImage', null);
    setFilePreview(null);
    setRegistrationError('');
    // Reset the file input
    const fileInput = document.getElementById('logoImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const handleSubmit = (values) => {
    // Check if registration is allowed to proceed
    if (registrationError) {
      return;
    }
    
    // Navigate to step 2, passing the form values
    navigate('/brand/register/step2', { state: { formData: values } });
  };
  
  // Sample brand categories
  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'home', label: 'Home & Furniture' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'travel', label: 'Travel & Hospitality' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' }
  ];
  
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
        <h1>THRIFT</h1>
        <h2>Register Your Brand</h2>
        
        <StepIndicator currentStep={1} />
        
        {registrationError && (
          <div className="registration-status error">{registrationError}</div>
        )}
        
        <Formik
          initialValues={{
            brandName: '',
            adminUsername: '',
            logoImage: null,
            category: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="brand-register-form">
              <div className="form-group">
                <label htmlFor="brandName">Brand Name</label>
                <Field 
                  id="brandName" 
                  name="brandName" 
                  type="text" 
                  placeholder="Enter your brand name"
                />
                <ErrorMessage name="brandName" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="adminUsername">Admin Username</label>
                <Field 
                  id="adminUsername" 
                  name="adminUsername" 
                  type="text" 
                  placeholder="Choose a username for brand admin"
                />
                <ErrorMessage name="adminUsername" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Brand Category</label>
                <Field 
                  as="select"
                  id="category" 
                  name="category" 
                >
                  {categories.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="category" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="logoImage">Brand Logo</label>
                <input
                  id="logoImage"
                  name="logoImage"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={(event) => handleFileChange(event, setFieldValue)}
                  className="file-input"
                />
                <div className="file-input-help">Upload your brand logo (PNG, JPG, WEBP or SVG, max 2MB)</div>
                <ErrorMessage name="logoImage" component="div" className="error-message" />
                
                {filePreview && (
                  <div className="logo-preview">
                    <img src={filePreview} alt="Logo Preview" />
                    <button 
                      type="button" 
                      className="remove-logo-icon"
                      onClick={() => handleRemoveLogo(setFieldValue)}
                      title="Remove selected logo"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="brand-register-button"
                  disabled={isSubmitting || !!registrationError}
                >
                  Continue
                </button>
                
                <button 
                  type="button" 
                  className="brand-register-button secondary-button"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default BrandRegisterStep1;
