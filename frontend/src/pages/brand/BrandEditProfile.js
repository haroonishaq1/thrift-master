import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isBrandAuthenticated, getBrandData } from '../../utils/auth';
import { brandAPI } from '../../services/api';
import { BRAND_CATEGORY_OPTIONS } from '../../constants/categories';
import '../../styles/brand/BrandEditProfile.css';

function BrandEditProfile() {
  const navigate = useNavigate();
  const [brandData, setBrandData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
      return;
    }
  }, [navigate]);

  // Load brand data
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        setIsLoading(true);
        
        // Get data from localStorage first
        const localData = getBrandData();
        if (localData) {
          setBrandData(localData);
          setFormData({
            name: localData.name || '',
            email: localData.email || '',
            website: localData.website || '',
            category: localData.category || ''
          });
        }

        // Try to get fresh data from API
        try {
          const response = await brandAPI.getBrandProfile();
          if (response.success && response.data) {
            const data = response.data.brand || response.data;
            setBrandData(data);
            setFormData({
              name: data.name || '',
              email: data.email || '',
              website: data.website || '',
              category: data.category || ''
            });
          }
        } catch (apiError) {
          console.warn('API fetch failed, using localStorage data');
        }

      } catch (err) {
        console.error('Error loading brand data:', err);
        setError('Failed to load brand data');
      } finally {
        setIsLoading(false);
      }
    };

    loadBrandData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await brandAPI.updateBrandProfile(formData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/brand/profile', { 
            state: { 
              forceRefresh: true, 
              updatedData: response.data 
            } 
          });
        }, 1500);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="brand-edit-profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="brand-edit-profile-container">
      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <div className="header-top">
            <h2 className="edit-profile-title">Edit Brand Profile</h2>
            <button 
              className="cancel-button"
              onClick={() => navigate('/brand/profile')}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="edit-profile-form-container">
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

          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-section">
              <h3>Brand Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Brand Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isSaving}
                >
                  {BRAND_CATEGORY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/brand/profile')}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BrandEditProfile;
