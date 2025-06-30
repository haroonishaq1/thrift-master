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
