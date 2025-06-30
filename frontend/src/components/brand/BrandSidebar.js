import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBrandToken, clearBrandAuth, getBrandData } from '../../utils/auth';
import '../../styles/brand/BrandSidebar.css';

function BrandSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [brandName, setBrandName] = useState('');
  
  // Update active tab based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/brand/dashboard') || path.includes('/brand/analytics')) {
      setActiveTab('dashboard');
    } else if (path.includes('/brand/add-offer')) {
      setActiveTab('addOffer');
    } else if (path.includes('/brand/offers')) {
      setActiveTab('offers');
    }
  }, [location]);
  
  // Get brand name from local storage
  useEffect(() => {
    const brandData = getBrandData();
    if (brandData && brandData.name) {
      setBrandName(brandData.name);
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      // Call the logout API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/brand-auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getBrandToken()}`
        }
      });
      
      // Clear local storage regardless of API response using our utility function
      clearBrandAuth();
      
      // Redirect to login page
      navigate('/brand/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect even if the API call fails
      clearBrandAuth();
      navigate('/brand/login');
    }
  };
  
  return (
    <div className="brand-sidebar">
      <div className="brand-sidebar-header">
        <h1>THRIFT</h1>
        <p className="brand-portal-text">Brand Portal</p>
        {brandName && <p className="brand-name">{brandName}</p>}
      </div>
      
      <div className="brand-sidebar-menu">
        <div 
          className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/brand/analytics')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </div>
        
        <div 
          className={`sidebar-menu-item ${activeTab === 'addOffer' ? 'active' : ''}`}
          onClick={() => navigate('/brand/add-offer')}
        >
          <i className="fas fa-plus-circle"></i>
          <span>Add New Offer</span>
        </div>
        
        <div 
          className={`sidebar-menu-item ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => navigate('/brand/offers')}
        >
          <i className="fas fa-tags"></i>
          <span>Offer List</span>
        </div>
      </div>
      
      <div className="brand-sidebar-footer">
        <div className="sidebar-menu-item logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default BrandSidebar;
