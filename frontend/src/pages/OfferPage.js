import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/OfferPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { offersAPI } from '../services/api';

function OfferPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [offerData, setOfferData] = useState(null);
  const [categoryOffers, setCategoryOffers] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [showCodeScreen, setShowCodeScreen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  
  // Backend URL for constructing full image paths
  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Set section title based on navigation source
  useEffect(() => {
    if (location.state) {
      const { source, title } = location.state;
      setSectionTitle(title);
    } else {
      setSectionTitle(''); // Default no title
    }
  }, [location.state]);
  
  useEffect(() => {
    const fetchOfferData = async () => {
      try {
        setLoading(true);
        
        // Start loading timeout - maximum 1 second
        const loadingTimeout = setTimeout(() => {
          setLoading(false);
        }, 1000);
        
        // Get the actual offer ID from URL to avoid React strict mode issues
        const actualOfferId = window.location.pathname.split('/offer/')[1];
        
        // Use actualOfferId instead of offerId
        const offerResponse = await offersAPI.getOfferById(actualOfferId);
        
        if (offerResponse.success && offerResponse.data) {
          const offer = offerResponse.data;
          setOfferData(offer);
          
          // Check if user came from hot deals, new lineup, category carousel, or brand carousel
          if (location.state && (location.state.source === 'hotdeals' || location.state.source === 'newlineup' || location.state.source === 'category' || location.state.source === 'brand')) {
            if (location.state.source === 'hotdeals') {
              // If from hot deals, show all featured/hot deals
              const hotDealsResponse = await offersAPI.getFeaturedOffers();
              if (hotDealsResponse.success && hotDealsResponse.data && hotDealsResponse.data.length > 0) {
                const hotDealsData = hotDealsResponse.data;
                setCategoryOffers(hotDealsData);
                
                // Find current offer index in hot deals
                const currentIndex = hotDealsData.findIndex(hotOffer => hotOffer.id.toString() === actualOfferId);
                setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
              } else {
                // Fallback to single offer
                setCategoryOffers([offer]);
                setCurrentOfferIndex(0);
              }
            } else if (location.state.source === 'newlineup') {
              // If from new lineup, show all new lineup offers
              const newLineupResponse = await offersAPI.getNewLineupOffers();
              if (newLineupResponse.success && newLineupResponse.data && newLineupResponse.data.length > 0) {
                const newLineupData = newLineupResponse.data;
                setCategoryOffers(newLineupData);
                
                // Find current offer index in new lineup
                const currentIndex = newLineupData.findIndex(lineupOffer => lineupOffer.id.toString() === actualOfferId);
                setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
              } else {
                // Fallback to single offer
                setCategoryOffers([offer]);
                setCurrentOfferIndex(0);
              }
            } else if (location.state.source === 'brand') {
              // If from brand carousel, show all offers from that brand
              const brandResponse = await offersAPI.getOffersByBrandId(offer.brand_id);
              if (brandResponse.success && brandResponse.data && brandResponse.data.length > 0) {
                const brandData = brandResponse.data;
                setCategoryOffers(brandData);
                
                // Find current offer index in brand offers
                const currentIndex = brandData.findIndex(brandOffer => brandOffer.id.toString() === actualOfferId);
                setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
              } else {
                // Fallback to single offer
                setCategoryOffers([offer]);
                setCurrentOfferIndex(0);
              }
            } else if (location.state.source === 'category') {
              // If from category carousel, show all offers from that category
              const categoryResponse = await offersAPI.getOffersByCategory(offer.category);
              if (categoryResponse.success && categoryResponse.data && categoryResponse.data.length > 0) {
                const categoryData = categoryResponse.data;
                setCategoryOffers(categoryData);
                
                // Find current offer index in category
                const currentIndex = categoryData.findIndex(categoryOffer => categoryOffer.id.toString() === actualOfferId);
                setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
              } else {
                // Fallback to single offer
                setCategoryOffers([offer]);
                setCurrentOfferIndex(0);
              }
            }
          } else {
            // No source context means single offer view - show only this offer
            setCategoryOffers([offer]);
            setCurrentOfferIndex(0);
            
            // Set appropriate title based on offer category
            const categoryTitles = {
              'electronics': 'Electronics & Technology',
              'fashion': 'Fashion', 
              'food': 'Food & Drink',
              'beauty': 'Beauty',
              'fitness': 'Fitness',
              'education': 'Education'
            };
            const categoryTitle = categoryTitles[offer.category] || offer.category?.toUpperCase() || 'OFFER';
            setSectionTitle(categoryTitle);
          }
        } else {
          throw new Error(offerResponse.message || 'Failed to fetch offer');
        }
        
        // Clear timeout and stop loading
        clearTimeout(loadingTimeout);
        
      } catch (err) {
        console.error('Error fetching offer:', err);
        setError(`Error fetching offer details: ${err.message}. Please try again later.`);
      } finally {
        setLoading(false);
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
      // Preserve the current navigation state
      navigate(`/offer/${newOfferId}`, { 
        replace: true,
        state: location.state 
      });
    }
  };

  const handleNextOffer = () => {
    if (categoryOffers.length > 1) {
      const newIndex = currentOfferIndex < categoryOffers.length - 1 ? currentOfferIndex + 1 : 0;
      setCurrentOfferIndex(newIndex);
      const newOfferId = categoryOffers[newIndex].id;
      // Preserve the current navigation state
      navigate(`/offer/${newOfferId}`, { 
        replace: true,
        state: location.state 
      });
    }
  };

  const handleIndicatorClick = (index) => {
    if (categoryOffers.length > 1 && index >= 0 && index < categoryOffers.length) {
      setCurrentOfferIndex(index);
      const newOfferId = categoryOffers[index].id;
      // Preserve the current navigation state
      navigate(`/offer/${newOfferId}`, { 
        replace: true,
        state: location.state 
      });
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

  if (!offerData || categoryOffers.length === 0 || loading) {
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
              {sectionTitle && (
                <h1 className="section-title">{sectionTitle}</h1>
              )}
            </div>
            <div className="offer-carousel-container">
              {categoryOffers.length > 1 && (
                <button 
                  className="carousel-nav-btn prev-btn" 
                  onClick={handlePrevOffer}
                  disabled={categoryOffers.length <= 1}
                >
                  <FaChevronLeft />
                </button>
              )}
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
              {categoryOffers.length > 1 && (
                <button 
                  className="carousel-nav-btn next-btn" 
                  onClick={handleNextOffer}
                  disabled={categoryOffers.length <= 1}
                >
                  <FaChevronRight />
                </button>
              )}
            </div>
            {/* Carousel Indicators */}
            {categoryOffers.length > 1 && (
              <div className="carousel-indicators">
                {categoryOffers.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentOfferIndex ? 'active' : ''}`}
                    onClick={() => handleIndicatorClick(index)}
                  />
                ))}
              </div>
            )}
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
