import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandSidebar from './BrandSidebar';
import { isBrandAuthenticated } from '../../utils/auth';
import '../../styles/brand/BrandLayout.css';

function BrandLayout({ children }) {
  const navigate = useNavigate();
  
  // Check if brand is authenticated
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
    }
  }, [navigate]);

  // Add CSS class to body for full height styling
  useEffect(() => {
    document.body.classList.add('brand-layout-active');
    document.documentElement.classList.add('brand-layout-active');
    
    return () => {
      document.body.classList.remove('brand-layout-active');
      document.documentElement.classList.remove('brand-layout-active');
    };
  }, []);
  
  return (
    <div className="brand-layout">
      <BrandSidebar />
      <div className="brand-container-with-sidebar">
        {children}
      </div>
    </div>
  );
}

export default BrandLayout;
