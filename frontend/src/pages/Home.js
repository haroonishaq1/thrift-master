import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaFire, FaLaptop } from 'react-icons/fa';
import { offersAPI } from '../services/api';

function Home({ isLoggedIn }) {
  const [currentSlide, setCurrentSlide] = useState(0); // Start at 0, update after brands load
  const [itemsPerView, setItemsPerView] = useState(3);
  const [electronicsOffers, setElectronicsOffers] = useState([]);
  const [fashionOffers, setFashionOffers] = useState([]);
  const [foodOffers, setFoodOffers] = useState([]);
  const [beautyOffers, setBeautyOffers] = useState([]);
  const [educationOffers, setEducationOffers] = useState([]);
  const [fitnessOffers, setFitnessOffers] = useState([]);
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [newLineupOffers, setNewLineupOffers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scrolling to category when navigating from other pages
  useEffect(() => {
    if (location.state?.scrollToCategory) {
      const categoryValue = location.state.scrollToCategory;
      
      // Wait for component to render and then scroll
      setTimeout(() => {
        scrollToCategorySection(categoryValue);
      }, 100);
      
      // Clear the state so it doesn't trigger again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const scrollToCategorySection = (categoryValue) => {
    // Map category values to section IDs (only for categories shown on Home page)
    const categoryToSectionId = {
      'food': 'food-drink-section',
      'electronics': 'electronics-section',
      'fashion': 'fashion-section',
      'all': 'shop-by-category-section'
    };
    
    const sectionId = categoryToSectionId[categoryValue];
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Add a highlight animation
        element.classList.add('highlight-section');
        setTimeout(() => {
          element.classList.remove('highlight-section');
        }, 2000);
      }
    }
  };

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Start loading timeout - maximum 1 second
        const loadingTimeout = setTimeout(() => {
          setLoading(false);
        }, 1000);
        
        // Fetch electronics offers
        const electronicsResponse = await offersAPI.getOffersByCategory('electronics');
        setElectronicsOffers(electronicsResponse.data?.slice(0, 4) || []);
        
        // Fetch fashion offers
        const fashionResponse = await offersAPI.getOffersByCategory('fashion');
        setFashionOffers(fashionResponse.data?.slice(0, 4) || []);
        
        // Fetch food & drink offers
        const foodResponse = await offersAPI.getOffersByCategory('food');
        setFoodOffers(foodResponse.data?.slice(0, 4) || []);
        
        // Fetch beauty offers
        const beautyResponse = await offersAPI.getOffersByCategory('beauty');
        setBeautyOffers(beautyResponse.data?.slice(0, 4) || []);
        
        // Fetch education offers
        const educationResponse = await offersAPI.getOffersByCategory('education');
        setEducationOffers(educationResponse.data?.slice(0, 4) || []);
        
        // Fetch fitness offers
        const fitnessResponse = await offersAPI.getOffersByCategory('fitness');
        setFitnessOffers(fitnessResponse.data?.slice(0, 4) || []);
        
        // Fetch featured offers (hot deals)
        const featuredResponse = await offersAPI.getFeaturedOffers(4);
        setFeaturedOffers(featuredResponse.data || []);
        
        // Fetch new lineup offers
        const newLineupResponse = await offersAPI.getNewLineupOffers();
        setNewLineupOffers(newLineupResponse.data || []);
        
        // Fetch brands
        const brandsResponse = await offersAPI.getBrands();
        setBrands(brandsResponse.data || []);
        
        // Clear timeout and stop loading
        clearTimeout(loadingTimeout);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays as fallback
        setElectronicsOffers([]);
        setFashionOffers([]);
        setFoodOffers([]);
        setBeautyOffers([]);
        setEducationOffers([]);
        setFitnessOffers([]);
        setFeaturedOffers([]);
        setNewLineupOffers([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set currentSlide to start at 0 to show the first items
  useEffect(() => {
    if (brands.length > 0) {
      setCurrentSlide(0);
    }
  }, [brands]);

  const nextSlide = () => {
    // Don't advance if there's only one brand
    if (brandCarouselItems.length <= 1) return;
    
    setCurrentSlide((prev) => {
      const maxSlide = brandCarouselItems.length - itemsPerView;
      return prev >= maxSlide ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    // Don't go back if there's only one brand
    if (brandCarouselItems.length <= 1) return;
    
    setCurrentSlide((prev) => {
      const maxSlide = brandCarouselItems.length - itemsPerView;
      return prev <= 0 ? maxSlide : prev - 1;
    });
  };

  // Handle responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerView(1);
      } else if (window.innerWidth <= 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate transform distance based on screen size (per card)
  const getTransformDistance = () => {
    if (window.innerWidth <= 768) {
      // Mobile: 1 card per view
      return window.innerWidth - 60;
    } else if (window.innerWidth <= 1024) {
      // Tablet: 2 cards per view  
      return (window.innerWidth - 80) / 2;
    } else {
      // Desktop: 285px card + 20px gap = 305px per card
      return 305;
    }
  };

  // Handle hot deals card click - single offer view
  const handleHotDealClick = (dealId) => {
    // Navigate without source context for single offer view
    navigate(`/offer/${dealId}`);
  };

  // Handle brand card click - navigate to offer page with first offer from that brand
  const handleBrandClick = async (brandId, brandName) => {
    // Prevent multiple rapid clicks
    if (handleBrandClick.isProcessing) {
      return;
    }
    
    try {
      handleBrandClick.isProcessing = true;
      
      // Get offers for this brand
      const response = await offersAPI.getOffersByBrandId(brandId);
      const brandOffers = response.data || [];
      
      if (brandOffers.length > 0) {
        // Navigate with brand context
        navigate(`/offer/${brandOffers[0].id}`, { 
          state: { 
            source: 'brand', 
            title: brandName 
          } 
        });
      } else {
        // If no offers, navigate to any available offer
        const allOffers = featuredOffers.concat(electronicsOffers, fashionOffers, foodOffers, beautyOffers, educationOffers);
        if (allOffers.length > 0) {
          navigate(`/offer/${allOffers[0].id}`);
        } else {
          navigate('/offers');
        }
      }
    } catch (error) {
      console.error('Error fetching offers for brand:', error);
      navigate('/offers');
    } finally {
      // Reset processing flag after a short delay
      setTimeout(() => {
        handleBrandClick.isProcessing = false;
      }, 1000);
    }
  };

  // Create dynamic carousel items from brands data (only approved brands with offers)
  const brandCarouselItems = brands.length > 0 ? brands
    .filter(brand => {
      // Only show approved brands
      if (brand.is_approved !== true) return false;
      
      // Check if this brand has any approved offers
      const brandOffers = featuredOffers.concat(electronicsOffers, fashionOffers, foodOffers, beautyOffers, educationOffers, fitnessOffers)
        .filter(offer => offer.brand_id === brand.id);
      
      // Only include brands that have at least one offer
      return brandOffers.length > 0;
    })
    .map((brand, index) => {
    const suffixes = ['Exclusive', 'Collection', 'Special', 'Premium'];
    const suffix = suffixes[index % suffixes.length];
    
    // Find the first offer for this brand to use its image
    const brandOffers = featuredOffers.concat(electronicsOffers, fashionOffers, foodOffers, beautyOffers, educationOffers, fitnessOffers)
      .filter(offer => offer.brand_id === brand.id);
    const firstBrandOffer = brandOffers[0];
    
    // Use actual offer image if available, otherwise fallback to carousel images
    const fallbackImages = [
      '/images/carousel/apple-promo.jpg',
      '/images/carousel/samsung-s25.jpg', 
      '/images/carousel/sky-streaming.jpg',
      '/images/carousel/wow-sport.jpg',
      '/images/carousel/samsung.jpg'
    ];
    
    const imageSrc = firstBrandOffer?.image_url 
      ? `http://localhost:5000${firstBrandOffer.image_url}`
      : fallbackImages[index % fallbackImages.length];
    
    return {
      id: brand.id,
      imageSrc: imageSrc, // Use actual offer image or fallback
      title: `${brand.name} ${suffix}`,
      description: `Up to 30% off on selected ${brand.name} items`,
      brandName: brand.name,
      logo: brand.logo ? `http://localhost:5000${brand.logo}` : null, // Brand logo for overlay
      brandId: brand.id
    };
  }) : []; // Return empty array instead of mock data

  // Only use the real brandCarouselItems, no duplication
  const extendedCarouselItems = brandCarouselItems;

  // Auto-advance carousel (only if we have multiple brands) - TEMPORARILY DISABLED FOR DEBUGGING
  /*
  useEffect(() => {
    if (brandCarouselItems.length > 1) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [brandCarouselItems.length]);
  */

  return (
    <div className="home">
      <Header isLoggedIn={isLoggedIn} />
      
      {/* Hero Carousel Section */}
      <section className="hero-carousel">
        {brandCarouselItems.length > 0 ? (
          <div className="carousel-wrapper">
            <div className="carousel-viewport">
              <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * getTransformDistance()}px)` }}>
              {extendedCarouselItems.map((item, index) => (
                <div 
                  key={`${item.id}-${index}`} 
                  className="carousel-card-wrapper"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBrandClick(item.brandId, item.brandName);
                  }}
                >
                  <ProductCard
                    id={item.id}
                    brand={item.brandName}
                    logo={item.logo}
                    imageSrc={item.imageSrc}
                    title={item.title}
                    description={item.description}
                    logoAlt={item.brandName}
                    disableClick={true}
                  />
                </div>
              ))}
            </div>
            </div>
            {brandCarouselItems.length > 1 && (
              <>
                <button className="nav-btn prev" onClick={prevSlide}>
                  <FaChevronLeft />
                </button>
                <button className="nav-btn next" onClick={nextSlide}>
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="no-brands-message">
            <div className="container">
              <div className="no-brands-content">
                <h3>No Brand Carousel Available</h3>
                <p>There are currently no approved brands to display in the carousel.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Hot Deals Section */}
      <section className="hot-deals">
        <div className="container">
          <div className="section-header">
            <div className="section-title-row">
              <div className="section-title-content">
                <FaFire className="fire-icon" />
                <h2>Hot Deals</h2>
              </div>
              <button className="show-more" onClick={() => {
                // Navigate to offers page with carousel view for "show more"
                navigate('/offers?category=featured&view=carousel');
              }}>
                Show more <span>→</span>
              </button>
            </div>
            <p>Don't miss out on these amazing student discounts!</p>
          </div>
          {loading ? (
            <div className="loading-spinner">Loading deals...</div>
          ) : (
            <div className="deals-grid">
              {featuredOffers.map((offer, index) => (
                <div key={offer.id || index} onClick={() => handleHotDealClick(offer.id)} style={{ cursor: 'pointer' }}>
                  <ProductCard
                    imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                    logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                    brand={offer.brand_name}
                    title={offer.title}
                    description={`${offer.discount_percent}% off`}
                    logoAlt={offer.brand_name}
                  />
                </div>
              ))}
            </div>
          )}
          {featuredOffers.length > 0 && (
            <div className="offers-count">
              <span>{featuredOffers.length > 4 ? '4' : featuredOffers.length} of {featuredOffers.length} offers</span>
            </div>
          )}
        </div>
      </section>

      {/* New to Lineup Section */}
      <section className="new-to-lineup">
        <div className="container">
          <div className="section-header">
            <div className="section-title-row">
              <div className="section-title-content">
                <h2>New to Lineup</h2>
              </div>
              {newLineupOffers.length > 0 && (
                <button className="show-more" onClick={() => {
                  navigate('/offers?category=newlineup&view=carousel');
                }}>
                  Show more <span>→</span>
                </button>
              )}
            </div>
            <p>Fresh offers just added - don't miss out!</p>
          </div>
          {loading ? (
            <div className="loading-spinner">Loading new lineup...</div>
          ) : newLineupOffers.length > 0 ? (
            <div className={`deals-grid offers-count-${newLineupOffers.length}`}>
              {newLineupOffers.map((offer, index) => (
                <div key={offer.id || index} onClick={() => navigate(`/offer/${offer.id}`)} style={{ cursor: 'pointer' }}>
                  <ProductCard
                    imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                    logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                    brand={offer.brand_name}
                    title={offer.title}
                    description={`${offer.discount_percent}% off`}
                    logoAlt={offer.brand_name}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-offers">
              <p>No lineup offers right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="shop-by-category" id="shop-by-category-section">
        <div className="container">
          <div className="main-section-header">
            <h2>Shop by Category</h2>
          </div>
          
          <div className="category-section" id="electronics-section">
            <div className="category-header">
              <div className="category-title-section">
                <h3>Electronics & Technology</h3>
                <button className="show-more" onClick={() => {
                  navigate('/offers?category=electronics&view=carousel');
                }}>
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Need a new smartphone, MacBook, or laptop? From Apple to MediaMarkt: We have the best tech deals for students.</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading electronics offers...</div>
            ) : (
              <div className={`category-offers-grid offers-count-${electronicsOffers.length}`}>
                {electronicsOffers.length > 0 ? (
                  electronicsOffers.map((offer, index) => (
                    <div key={offer.id || index} onClick={() => navigate(`/offer/${offer.id}`)} style={{ cursor: 'pointer' }}>
                      <ProductCard
                        imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                        logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                        brand={offer.brand_name}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-offers">
                    <p>No electronics offers available at the moment. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="category-section" id="fashion-section">
            <div className="category-header">
              <div className="category-title-section">
                <h3>Fashion</h3>
                <button className="show-more" onClick={() => {
                  navigate('/offers?category=fashion&view=carousel');
                }}>
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Stay stylish with the best fashion deals for students. From trendy clothing to accessories, find your perfect look for less.</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading fashion offers...</div>
            ) : (
              <div className={`category-offers-grid offers-count-${fashionOffers.length}`}>
                {fashionOffers.length > 0 ? (
                  fashionOffers.map((offer, index) => (
                    <div key={offer.id || index} onClick={() => navigate(`/offer/${offer.id}`)} style={{ cursor: 'pointer' }}>
                      <ProductCard
                        imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                        logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                        brand={offer.brand_name}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-offers">
                    <p>No fashion offers available at the moment. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="category-section" id="food-drink-section">
            <div className="category-header">
              <div className="category-title-section">
                <h3>Food & Drink</h3>
                <button className="show-more" onClick={() => {
                  navigate('/offers?category=food&view=carousel');
                }}>
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Discover amazing deals on food and beverages. From restaurant vouchers to grocery discounts, save on your favorite meals and drinks.</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading food & drink offers...</div>
            ) : (
              <div className={`category-offers-grid offers-count-${foodOffers.length}`}>
                {foodOffers.length > 0 ? (
                  foodOffers.map((offer, index) => (
                    <div key={offer.id || index} onClick={() => navigate(`/offer/${offer.id}`)} style={{ cursor: 'pointer' }}>
                      <ProductCard
                        imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                        logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                        brand={offer.brand_name}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-offers">
                    <p>No food & drink offers available at the moment. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="app-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-text">
              <h2>Discover even more with Thrift</h2>
              <p>Exclusive student discounts, amazing deals, and premium offers – all in one place!</p>
              <div className="app-rating">
                <span className="rating-score">4.8</span>
                <div className="stars">★★★★★</div>
                <span className="review-count">36k reviews</span>
              </div>
            </div>
            <div className="banner-image">
              {/* Replace this with actual banner image */}
              <div className="phone-mockup">
                <img src="/images/iPhone-15-Pro.svg" alt="Thrift Platform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
