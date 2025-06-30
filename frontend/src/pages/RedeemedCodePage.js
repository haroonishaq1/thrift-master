import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RedeemedCodePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { offersAPI } from '../services/api';

function RedeemedCodePage() {
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState(null);

  // Backend URL for constructing full image paths
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Function to extract just the discount amount (e.g., "£150 off" from "£150 off + Free Galaxy Buds")
  const getDiscountAmount = (discountText) => {
    if (!discountText) return discountText;
    
    // Try to extract percentage discount (e.g., "15%" from "15% off")
    const percentMatch = discountText.match(/(\d+%)/);
    if (percentMatch) return percentMatch[1] + " discount";
    
    // Try to extract monetary discount (e.g., "£150 off" from "£150 off + Free Galaxy Buds")
    const moneyMatch = discountText.match(/(£\d+\s*off|€\d+\s*off|\$\d+\s*off)/i);
    if (moneyMatch) return moneyMatch[1];
    
    // If no specific pattern found, return first part before "+" or ","
    const firstPart = discountText.split(/[+,]/)[0].trim();
    return firstPart || discountText;
  };

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const offerResponse = await offersAPI.getOfferById(offerId);
        
        if (offerResponse.success && offerResponse.data) {
          const offerData = offerResponse.data;
          console.log('🎯 Offer data received:', offerData);
          console.log('🏢 Brand website in offer:', offerData.brand_website);
          setOffer(offerData);
          
          // Generate a code with format: THRIFT-BRANDID-OFFER-ID-random6digits
          const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
          const code = `THRIFT-${offerData.id}-${offerId}-${randomSixDigits}`;
          setGeneratedCode(code);
        } else {
          throw new Error(offerResponse.message || 'Failed to fetch offer');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching offer:', error);
        setLoading(false);
      }
    };

    if (offerId) {
      fetchOffer();
    }
  }, [offerId]);

  const handleShowCode = () => {
    setShowCode(true);
  };

  const handleRating = (type) => {
    setUserRating(type);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWebsite = () => {
    console.log('🔍 Open Website clicked');
    console.log('📦 Offer data:', offer);
    console.log('🌐 Brand website:', offer?.brand_website);
    console.log('🔗 Redemption URL:', offer?.redemptionUrl);
    
    // First try brand website, then fallback to redemption URL
    const websiteUrl = offer?.brand_website || offer?.redemptionUrl;
    console.log('🎯 Final website URL:', websiteUrl);
    
    if (websiteUrl) {
      // Ensure the URL has a protocol
      let finalUrl = websiteUrl;
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        finalUrl = 'https://' + websiteUrl;
      }
      console.log('🚀 Opening URL:', finalUrl);
      window.open(finalUrl, '_blank');
    } else {
      console.warn('❌ No website URL available for this brand');
      alert('No website URL available for this brand');
    }
  };

  if (loading) {
    return (
      <div className="redeemed-page">
        <Header />
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="redeemed-page">
        <Header />
        <div className="error-container">
          <div className="error">Offer not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="redeemed-page">
      <Header />
      
      <div className="redeemed-main">
        <div className="redeemed-container">
          {/* Brand Logo - Outside the card */}
          <div className="offer-brand-logo-center">
            <img 
              src={offer.brand_logo ? `${BACKEND_URL}${offer.brand_logo}` : "/images/logos/placeholder.svg"} 
              alt={offer.brand_name}
              onError={(e) => {
                e.target.src = "/images/logos/placeholder.svg";
              }}
            />
          </div>
          
          <div className="redeemed-card">
            {/* Large Discount Text */}
            <h1 className="discount-title">{getDiscountAmount(offer.description)}</h1>
            
            {/* Rating Section */}
            <div className="rating-section">
              <p className="rate-text">Rate this offer:</p>
              <div className="rating-buttons">
                <button 
                  className={`rating-btn thumbs-up ${userRating === 'up' ? 'active' : ''}`}
                  onClick={() => handleRating('up')}
                >
                  👍
                </button>
                <button 
                  className={`rating-btn thumbs-down ${userRating === 'down' ? 'active' : ''}`}
                  onClick={() => handleRating('down')}
                >
                  👎
                </button>
              </div>
            </div>
            
            {/* Code Display - Below rating buttons */}
            {showCode && (
              <div className="code-container">
                <input 
                  type="text" 
                  value={generatedCode} 
                  readOnly 
                  className="code-field"
                />
                <button 
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
            
            {/* Instruction Text */}
            <p className="instruction-text">
              Enter this code at checkout to get {getDiscountAmount(offer.description)}.
            </p>
            
            {/* Additional Text */}
            <p className="additional-text">
              Get your code now and visit the {offer.brand_name} website.
            </p>
            
            {/* Show Code Button */}
            {!showCode && (
              <button className="show-code-btn" onClick={handleShowCode}>
                Show code
              </button>
            )}
            
            {/* Open Website Button - Always shown */}
            {showCode && (
              <button className="open-website-btn" onClick={handleOpenWebsite}>
                Open website
              </button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default RedeemedCodePage;
