import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/OfferPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { offersAPI } from '../services/api';

function OfferPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offerData, setOfferData] = useState(null);
  const [categoryOffers, setCategoryOffers] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(null);
  const [showCodeScreen, setShowCodeScreen] = useState(false);
  
  // Backend URL for constructing full image paths
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    const fetchOfferData = async () => {
      try {
        // Get the actual offer ID from URL to avoid React strict mode issues
        const actualOfferId = window.location.pathname.split('/offer/')[1];
        
        // Use actualOfferId instead of offerId
        const offerResponse = await offersAPI.getOfferById(actualOfferId);
        
        if (offerResponse.success && offerResponse.data) {
          const offer = offerResponse.data;
          setOfferData(offer);
          
          // Get all offers from the same brand (prioritize brand over category)
          if (offer.brand_id) {
            const brandResponse = await offersAPI.getOffersByBrandId(offer.brand_id);
            
            if (brandResponse.success && brandResponse.data && brandResponse.data.length > 0) {
              const brandData = brandResponse.data;
              setCategoryOffers(brandData);
              
              // Find the index of the current offer in the brand list
              const currentIndex = brandData.findIndex(brandOffer => brandOffer.id.toString() === offerId.toString());
              setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
            } else {
              // Fallback to category offers if no brand offers found
              if (offer.category) {
                const categoryResponse = await offersAPI.getOffersByCategory(offer.category);
                if (categoryResponse.success && categoryResponse.data) {
                  setCategoryOffers(categoryResponse.data);
                  const currentIndex = categoryResponse.data.findIndex(categoryOffer => categoryOffer.id.toString() === offerId.toString());
                  setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
                } else {
                  setCategoryOffers([offer]);
                  setCurrentOfferIndex(0);
                }
              } else {
                setCategoryOffers([offer]);
                setCurrentOfferIndex(0);
              }
            }
          } else if (offer.category) {
            // Fallback to category-based offers if no brand_id
            const categoryResponse = await offersAPI.getOffersByCategory(offer.category);
            
            if (categoryResponse.success && categoryResponse.data) {
              const categoryData = categoryResponse.data;
              setCategoryOffers(categoryData);
              
              // Find the index of the current offer in the category list
              const currentIndex = categoryData.findIndex(categoryOffer => categoryOffer.id.toString() === offerId.toString());
              setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
            } else {
              // If no category offers found, just show this single offer
              setCategoryOffers([offer]);
              setCurrentOfferIndex(0);
            }
          } else {
            // If no category, just show this single offer
            setCategoryOffers([offer]);
            setCurrentOfferIndex(0);
          }
        } else {
          throw new Error(offerResponse.message || 'Failed to fetch offer');
        }
      } catch (err) {
        console.error('Error fetching offer:', err);
        setError(`Error fetching offer details: ${err.message}. Please try again later.`);
      }
    };

    if (offerId) {
      fetchOfferData();
    }
  }, [offerId]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevOffer();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextOffer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleRedeemNow = () => {
    navigate(`/redeem-code/${offerId}`);
  };

  const handleShowCode = () => {
    navigate(`/redeem-code/${offerId}`);
  };

  const handlePrevOffer = () => {
    if (categoryOffers.length > 1) {
      const newIndex = currentOfferIndex > 0 ? currentOfferIndex - 1 : categoryOffers.length - 1;
      setCurrentOfferIndex(newIndex);
      const newOfferId = categoryOffers[newIndex].id;
      navigate(`/offer/${newOfferId}`, { replace: true });
    }
  };

  const handleNextOffer = () => {
    if (categoryOffers.length > 1) {
      const newIndex = currentOfferIndex < categoryOffers.length - 1 ? currentOfferIndex + 1 : 0;
      setCurrentOfferIndex(newIndex);
      const newOfferId = categoryOffers[newIndex].id;
      navigate(`/offer/${newOfferId}`, { replace: true });
    }
  };

  const handleIndicatorClick = (index) => {
    if (categoryOffers.length > 1 && index >= 0 && index < categoryOffers.length) {
      setCurrentOfferIndex(index);
      const newOfferId = categoryOffers[index].id;
      navigate(`/offer/${newOfferId}`, { replace: true });
    }
  };

  // Redirect to home if there is an error fetching the offer
  useEffect(() => {
    if (error) {
      navigate('/', { replace: true });
    }
  }, [error, navigate]);

  if (error) {
    return null;
  }

  if (!offerData || categoryOffers.length === 0) {
    return (
      <div className="offer-page">
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading offer details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="offer-page">
      <Header />
      <div className="offer-page-container">
        {!showCodeScreen ? (
          // First Screen: Carousel-style offer display
          <>
            <div className="category-header">
              {categoryOffers.length > 1 && (
                <p className="offer-counter">
                  {currentOfferIndex + 1} of {categoryOffers.length} offers
                </p>
              )}
            </div>
            <div className="offer-carousel-container">
              <button 
                className="carousel-nav-btn prev-btn" 
                onClick={handlePrevOffer}
                disabled={categoryOffers.length <= 1}
              >
                <span>&lt;</span>
              </button>
              <div className="offer-carousel-card">
                <div className="offer-content-wrapper">
                  <div className="offer-text-content">
                    {offerData.brand_logo && (
                      <div className="offer-brand-section">
                        <img 
                          src={`${BACKEND_URL}${offerData.brand_logo}`}
                          alt={`${offerData.brand_name} logo`}
                          className="brand-logo-round"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <h3 className="offer-main-title">{offerData.title}</h3>
                    <p className="offer-description-text">{offerData.description}</p>
                  </div>
                  <div className="offer-cta-section">
                    <button className="redeem-now-btn" onClick={handleRedeemNow}>
                      Redeem now
                    </button>
                  </div>
                </div>
                <div className="offer-image-section-large">
                  <img 
                    src={offerData.image_url ? `${BACKEND_URL}${offerData.image_url}` : "/images/placeholder.jpg"} 
                    alt={offerData.title}
                    className="offer-main-image"
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />
                </div>
              </div>
              <button 
                className="carousel-nav-btn next-btn" 
                onClick={handleNextOffer}
                disabled={categoryOffers.length <= 1}
              >
                <span>&gt;</span>
              </button>
            </div>
          </>
        ) : (
          // Second Screen: Rating and "Show code" - simplified layout
          <div className="redeem-screen">
            <div className="redeem-content">
              <h1 className="discount-title">{offerData.description}</h1>
              <div className="offer-rating">
                <p>Rate this offer:</p>
                <div className="rating-buttons">
                  <button 
                    className={`thumbs-up ${rating === true ? 'active' : ''}`} 
                    onClick={() => handleRating(true)}
                  >
                    👍
                  </button>
                  <button 
                    className={`thumbs-down ${rating === false ? 'active' : ''}`} 
                    onClick={() => handleRating(false)}
                  >
                    👎
                  </button>
                </div>
              </div>
              <div className="offer-action">
                <p>Enter this code at checkout to get {offerData.description}.</p>
                <p className="visit-website">Get your code now and visit the {offerData.brand_name} website.</p>
                <button className="show-code-btn" onClick={handleShowCode}>
                  Show code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OfferPage;
