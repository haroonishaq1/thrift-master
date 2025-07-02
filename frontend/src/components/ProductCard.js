import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

const ProductCard = memo(function ProductCard({ id, brand, discount, logo, imageSrc, title, description, logoAlt, disableClick }) {
  const navigate = useNavigate();
  const [logoLoaded, setLogoLoaded] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const [imageKey, setImageKey] = React.useState(0);
  const logoRef = React.useRef();

  // Reset logo state only when logo URL actually changes
  React.useEffect(() => {
    if (logoRef.current && logoRef.current.src !== logo) {
      setLogoLoaded(false);
      setLogoError(false);
      setImageKey(prev => prev + 1);
    }
  }, [logo]);

  const handleClick = () => {
    // Don't navigate if disableClick is true (handled by parent wrapper)
    if (disableClick) return;
    
    // Navigate to the offer page with normal navigation (not replace) for browser back to work
    navigate(`/offer/${id || brand?.toLowerCase().replace(/\s+/g, '-') || title?.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="product-card" onClick={handleClick} style={{ cursor: disableClick ? 'default' : 'pointer' }}>
      <div className="card-image-container">
        <img src={imageSrc} alt={title || brand} className="main-image" />
        <div className={`brand-logo-overlay ${logoLoaded && !logoError ? 'has-logo' : ''}`}>
          {logo && logo.trim() && !logoError ? (
            <img 
              ref={logoRef}
              key={`logo-${imageKey}-${logo}`} // Force new image element on changes
              src={logo} 
              alt={logoAlt || brand} 
              className="brand-logo-img"
              onError={(e) => {
                console.error('❌ Logo failed to load:', logo);
                setLogoError(true);
                setLogoLoaded(false);
              }}
              onLoad={(e) => {
                setLogoLoaded(true);
                setLogoError(false);
              }}
              style={{
                opacity: logoLoaded ? 1 : 0.8,
                transition: 'opacity 0.2s ease',
                transform: logoLoaded ? 'scale(1)' : 'scale(0.9)',
                willChange: 'transform, opacity'
              }}
            />
          ) : (
            <div className="brand-initial">
              {(brand || title || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <div className="card-info">
        <div className="discount-badge">
          {description || discount}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
