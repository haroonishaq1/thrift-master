import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { getBrandToken, isBrandAuthenticated } from '../../utils/auth';
import { offersAPI, brandAPI } from '../../services/api';
import '../../styles/brand/BrandAddOffer.css';

function BrandAddOffer() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [brandData, setBrandData] = useState(null);
  // Check for token and redirect to login if not present
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
    }
  }, [navigate]);

  // Fetch brand data to get category
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const response = await brandAPI.getBrandProfile();
        if (response.success) {
          setBrandData(response.data);
        }
      } catch (error) {
        console.error('Error fetching brand data:', error);
      }
    };

    if (isBrandAuthenticated()) {
      fetchBrandData();
    }
  }, []);
  
  // Offer validation schema
  const validationSchema = Yup.object({
    offerName: Yup.string()
      .required('Offer name is required')
      .max(100, 'Offer name must not exceed 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .max(1000, 'Description must not exceed 1000 characters'),
    offerImage: Yup.mixed()
      .required('Offer image is required')
      .test('fileFormat', 'Only .png, .jpg, .jpeg, .webp, and .svg files are accepted', value => {
        if (!value) return true;
        return ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(value.type);
      }),
    discountPercentage: Yup.number()
      .required('Discount percentage is required')
      .min(1, 'Discount must be at least 1%')
      .max(100, 'Discount cannot exceed 100%')
  });
  
  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    
    if (file) {
      // Check if file is one of the allowed types
      if (['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        setFieldValue('offerImage', file);
        
        // Create a preview for the image
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the input and set field error
        event.target.value = null;
        setFieldValue('offerImage', null);
      }
    }
  };  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitError(null);
      
      // Prepare offer data for the new API
      const offerData = {
        title: values.offerName.trim(),
        description: values.description.trim(),
        discount_percent: values.discountPercentage,
        category: brandData?.category || '',
        offerImage: values.offerImage
      };

      console.log('Creating offer with data:', offerData);

      // Create offer using the new API
      const response = await offersAPI.createOffer(offerData);
      
      if (response.success) {
        console.log('Offer created successfully:', response.data);
        
        // Reset form and preview
        resetForm();
        setImagePreview(null);
        
        // Navigate to offers list page with success message
        navigate('/brand/offers', { 
          state: { 
            message: 'Offer created successfully!',
            type: 'success'
          }
        });
      } else {
        throw new Error(response.message || 'Failed to create offer');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      setSubmitError(error.message || 'An error occurred while creating the offer');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="brand-add-offer-container">
      <div className="brand-add-offer-form-wrapper">        <h2>Add New Offer</h2>
        {submitError && (
          <div className="error-banner">
            <p>{submitError}</p>
            <button onClick={() => setSubmitError(null)}>✕</button>
          </div>
        )}
        <Formik
          initialValues={{
            offerName: '',
            description: '',
            offerImage: null,
            discountPercentage: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="brand-add-offer-form">
              <div className="form-group">
                <label htmlFor="offerName">Offer Name *</label>
                <Field 
                  id="offerName" 
                  name="offerName" 
                  type="text" 
                  placeholder="Enter offer name"
                />
                <ErrorMessage name="offerName" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <Field 
                  as="textarea"
                  id="description" 
                  name="description" 
                  rows="4"
                  placeholder="Enter offer description"
                />
                <ErrorMessage name="description" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="discountPercentage">Discount Percentage *</label>
                <Field 
                  id="discountPercentage" 
                  name="discountPercentage" 
                  type="number" 
                  min="1"
                  max="100"
                  placeholder="Enter discount percentage"
                />
                <ErrorMessage name="discountPercentage" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="offerImage">Offer Image *</label>
                <div className="file-input-container">
                  <input
                    id="offerImage"
                    name="offerImage"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.svg"
                    onChange={(event) => handleImageChange(event, setFieldValue)}
                    className="file-input"
                  />
                  <div className="file-input-label">Click or drag to upload image</div>
                </div>
                {errors.offerImage && touched.offerImage && (
                  <div className="error-message">{errors.offerImage}</div>
                )}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Offer Preview" className="image-preview" />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => navigate('/brand/offers')}
                >
                  Cancel
                </button>
                <button type="submit" className="save-offer-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default BrandAddOffer;
