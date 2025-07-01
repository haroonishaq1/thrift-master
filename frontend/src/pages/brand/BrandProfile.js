import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isBrandAuthenticated, getBrandData, clearBrandAuth } from '../../utils/auth';
import { brandAPI } from '../../services/api';
import '../../styles/brand/BrandProfile.css';

function BrandProfile() {
  const navigate = useNavigate();
  const [brandData, setBrandData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and redirect
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
      return;
    }
  }, [navigate]);

  // Load brand profile data
  useEffect(() => {
    const fetchBrandProfile = async () => {
      try {
        setIsLoading(true);
        
        // First try to get from localStorage
        const localBrandData = getBrandData();
        if (localBrandData) {
          setBrandData(localBrandData);
        }

        // Then try to get complete profile data from API
        try {
          const profileResponse = await brandAPI.getBrandProfile();
          console.log('🔍 Full API response:', profileResponse);
          if (profileResponse.success && profileResponse.data && profileResponse.data.brand) {
            const brandData = profileResponse.data.brand;
            console.log('✅ API Profile data:', brandData);
            console.log('🔍 Available API fields:', Object.keys(brandData));
            console.log('🔍 API Phone field:', brandData.phone_number);
            console.log('🔍 API Website field:', brandData.website);
            setBrandData(brandData);
          }
        } catch (apiError) {
          console.log('ℹ️ API profile not available, using localStorage data:', apiError.message);
          // If API fails, we already have localStorage data as fallback
        }
        
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching brand profile:', err);
        setError(err.message);
        
        if (err.message.includes('authentication') || err.message.includes('token')) {
          clearBrandAuth();
          navigate('/brand/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandProfile();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate('/brand/edit-profile');
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>No brand data found</p>
            <button onClick={() => navigate('/brand/login')}>Login Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-top">
            <h2 className="profile-title">Brand Profile</h2>
            <button 
              className="edit-button"
              onClick={handleEditProfile}
            >
              Edit
            </button>
          </div>
          <div className="profile-user-section">
            <div className="profile-avatar">
              {brandData.logo ? (
                <img 
                  src={brandData.logo.startsWith('http') 
                    ? brandData.logo 
                    : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${brandData.logo}`}
                  alt={`${brandData.name} logo`}
                  className="profile-icon brand-logo"
                />
              ) : (
                <div className="profile-icon">
                  <div className="brand-icon"></div>
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{brandData.name}</h1>
              <p className="profile-subtitle">{brandData.category || 'Brand'}</p>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Brand Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Brand Name</label>
                <div className="detail-value">{brandData.name || ''}</div>
              </div>
              <div className="detail-item">
                <label>Email address</label>
                <div className="detail-value">{brandData.email || ''}</div>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <div className="detail-value">{brandData.phone_number || ''}</div>
              </div>
              <div className="detail-item">
                <label>Website</label>
                <div className="detail-value">
                  {brandData.website ? (
                    <a href={brandData.website} target="_blank" rel="noopener noreferrer">
                      {brandData.website}
                    </a>
                  ) : ''}
                </div>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <div className="detail-value">{brandData.category || ''}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Registration Date</label>
                <div className="detail-value">
                  {brandData.created_at ? new Date(brandData.created_at).toLocaleDateString() : ''}
                </div>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <div className="detail-value">
                  <span className={`status-badge ${brandData.is_approved ? 'active' : 'inactive'}`}>
                    {brandData.is_approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandProfile;
