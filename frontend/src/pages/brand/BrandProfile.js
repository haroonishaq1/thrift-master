import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isBrandAuthenticated, getBrandData, clearBrandAuth } from '../../utils/auth';
import { brandAPI } from '../../services/api';
import '../../styles/brand/BrandProfile.css';

function BrandProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [brandData, setBrandData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear navigation state after processing
  useEffect(() => {
    if (location.state?.refreshData) {
      // Clear the state to prevent unnecessary re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
        
        // Check if we have updated data from navigation state
        const forceRefresh = location.state?.forceRefresh;
        const updatedData = location.state?.updatedData;
        
        if (forceRefresh && updatedData) {
          console.log('🔍 Using updated data from edit page:', updatedData);
          setBrandData(updatedData);
          setIsLoading(false);
          return;
        }
        
        // Always fetch fresh data from API to ensure complete data
        try {
          console.log('🔍 Fetching fresh profile data from API...');
          const profileResponse = await brandAPI.getBrandProfile();
          console.log('🔍 Full API response:', profileResponse);
          if (profileResponse.success && profileResponse.data && profileResponse.data.brand) {
            const freshBrandData = profileResponse.data.brand;
            console.log('✅ Fresh API Profile data:', freshBrandData);
            setBrandData(freshBrandData);
            
            // Update localStorage with fresh data
            const token = localStorage.getItem('brand-token');
            if (token) {
              const { storeBrandAuth } = await import('../../utils/auth');
              storeBrandAuth(token, freshBrandData);
              console.log('✅ Updated localStorage with fresh data');
            }
          }
        } catch (apiError) {
          console.log('ℹ️ API profile fetch failed:', apiError.message);
          // If API fails, fallback to localStorage data
          const localBrandData = getBrandData();
          console.log('🔍 Fallback to localStorage data:', localBrandData);
          if (localBrandData) {
            setBrandData(localBrandData);
          }
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
  }, [navigate, location.state]);

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
          </div>
          <div className="profile-user-section">
            <div className="profile-header-content">
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

          <div className="profile-actions">
            <button 
              className="change-password-button"
              onClick={() => navigate('/brand/change-password')}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandProfile;
