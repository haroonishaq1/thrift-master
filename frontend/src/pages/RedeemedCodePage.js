import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RedeemedCodePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { offersAPI } from '../services/api';
import { isUserAuthenticated } from '../utils/auth';

function RedeemedCodePage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeAlreadyGenerated, setCodeAlreadyGenerated] = useState(false);

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
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to access this page',
          redirectTo: `/redeem-code/${offerId}`
        }
      });
      return;
    }

    const fetchOffer = async () => {
      try {
        setLoading(true);
        
        // Check if code was already generated for this offer
        const codeKey = `code_generated_${offerId}`;
        const existingCode = localStorage.getItem(codeKey);
        
        if (existingCode) {
          setCodeAlreadyGenerated(true);
          setGeneratedCode(existingCode);
        }
        
        const offerResponse = await offersAPI.getOfferById(offerId);
        
        if (offerResponse.success && offerResponse.data) {
          const offerData = offerResponse.data;
          console.log('🎯 Offer data received:', offerData);
          console.log('🏢 Brand website in offer:', offerData.brand_website);
          setOffer(offerData);
          
          // Only generate new code if one doesn't exist
          if (!existingCode) {
            const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
            const code = `THRIFT-${offerData.id}-${offerId}-${randomSixDigits}`;
            setGeneratedCode(code);
          }
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
    if (codeAlreadyGenerated) {
      alert('You have already generated your code. You cannot generate again.');
      return;
    }
    
    // Save code to localStorage
    const codeKey = `code_generated_${offerId}`;
    localStorage.setItem(codeKey, generatedCode);
    setCodeAlreadyGenerated(true);
    setShowCode(true);
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
            
            {/* Show Code Button or Already Generated Message */}
            {!showCode && !codeAlreadyGenerated && (
              <button className="show-code-btn" onClick={handleShowCode}>
                Show code
              </button>
            )}
            
            {!showCode && codeAlreadyGenerated && (
              <div className="already-generated-message">
                <p>You have already generated your code. You cannot generate again.</p>
                <button className="show-existing-code-btn" onClick={() => setShowCode(true)}>
                  View Your Code
                </button>
              </div>
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
