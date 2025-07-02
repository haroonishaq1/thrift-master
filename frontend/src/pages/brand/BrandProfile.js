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
        
        // Try to get data from localStorage first
        const localData = getBrandData();
        if (localData) {
          console.log('✅ Using localStorage brand data:', localData);
          // Normalize localStorage data as well
          const normalizedLocalData = {
            ...localData,
            // Handle phone number field variations
            phone_number: localData.phone_number || localData.phone || null,
            // Handle approval status field variations
            approved: localData.approved || localData.is_approved || false,
            // Ensure other fields are properly mapped
            name: localData.name || '',
            email: localData.email || '',
            website: localData.website || '',
            category: localData.category || '',
            logo: localData.logo || '',
            created_at: localData.created_at || localData.createdAt || null
          };
          setBrandData(normalizedLocalData);
        }
        
        // Also try to fetch fresh data from API
        try {
          const profileResponse = await brandAPI.getBrandProfile();
          if (profileResponse.success && profileResponse.data) {
            console.log('✅ Fresh profile data loaded:', profileResponse.data);
            // Check if data is nested under 'brand' property
            const rawBrandData = profileResponse.data.brand || profileResponse.data;
            
            // Normalize data structure to handle different field names
            const normalizedBrandData = {
              ...rawBrandData,
              // Handle phone number field variations
              phone_number: rawBrandData.phone_number || rawBrandData.phone || null,
              // Handle approval status field variations
              approved: rawBrandData.approved || rawBrandData.is_approved || false,
              // Ensure other fields are properly mapped
              name: rawBrandData.name || '',
              email: rawBrandData.email || '',
              website: rawBrandData.website || '',
              category: rawBrandData.category || '',
              logo: rawBrandData.logo || '',
              created_at: rawBrandData.created_at || rawBrandData.createdAt || null
            };
            
            console.log('✅ Normalized brand data:', normalizedBrandData);
            setBrandData(normalizedBrandData);
          }
        } catch (apiError) {
          console.warn('⚠️ API fetch failed, using localStorage data:', apiError.message);
          // localData is already set above if it exists
          if (!localData) {
            throw new Error('No brand data available');
          }
        }
        
      } catch (err) {
        console.error('❌ Error fetching brand profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandProfile();
  }, []);

  const handleLogout = () => {
    clearBrandAuth();
    navigate('/brand/login');
  };

  if (isLoading) {
    return (
      <div className="brand-profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-profile-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="brand-profile-container">
        <div className="error">No brand data found</div>
      </div>
    );
  }

  return (
    <div className="brand-profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-top">
            <h2 className="profile-title">Brand Profile</h2>
            <button 
              className="edit-button"
              onClick={() => navigate('/brand/edit-profile')}
            >
              Edit
            </button>
          </div>
          
          <div className="profile-user-section">
            <div className="profile-info">
              <div className="brand-avatar">
                {brandData.logo ? (
                  <img 
                    src={brandData.logo.startsWith('http') 
                      ? brandData.logo 
                      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${brandData.logo}`}
                    alt={`${brandData.name} logo`}
                    className="brand-logo"
                  />
                ) : (
                  <div className="brand-placeholder">
                    {(brandData.name || 'B').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="brand-details">
                <h1>{brandData.name}</h1>
                <p className="brand-category">{brandData.category || 'Brand'}</p>
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
                <div className="detail-value">{brandData.name}</div>
              </div>
              <div className="detail-item">
                <label>Email Address</label>
                <div className="detail-value">{brandData.email}</div>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <div className="detail-value">
                  {brandData.category || <span className="not-provided">Not provided</span>}
                </div>
              </div>
              <div className="detail-item">
                <label>Website</label>
                <div className="detail-value">
                  {brandData.website ? (
                    <a href={brandData.website} target="_blank" rel="noopener noreferrer">
                      {brandData.website}
                    </a>
                  ) : (
                    <span className="not-provided">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Account Status</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Approval Status</label>
                <div className="detail-value">
                  <span className={`status-badge ${(brandData.approved || brandData.is_approved) ? 'approved' : 'pending'}`}>
                    {(brandData.approved || brandData.is_approved) ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <label>Member Since</label>
                <div className="detail-value">
                  {brandData.created_at ? new Date(brandData.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="offers-button"
              onClick={() => navigate('/brand/offers')}
            >
              Manage Offers
            </button>
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
