import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { offersAPI } from '../services/api';
import '../styles/Offers.css';

const Offers = ({ isLoggedIn }) => {
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const navigate = useNavigate();
  
  // Get category from URL params
  const category = searchParams.get('category');
  const view = searchParams.get('view');
  const brandId = searchParams.get('brand_id');
  const brandName = searchParams.get('brand_name');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Start loading timeout - maximum 1 second
        const loadingTimeout = setTimeout(() => {
          setLoading(false);
        }, 1000);
        
        if (brandId) {
          // Fetch offers for specific brand
          const response = await offersAPI.getOffersByBrandId(brandId);
          setOffers(response.data || []);
          setCategoryName(brandName || 'Brand Offers');
        } else if (category) {
          let response;
          
          // Handle special categories
          if (category === 'featured') {
            // Fetch all featured offers for Hot Deals
            response = await offersAPI.getFeaturedOffers(100); // Get all featured offers
          } else if (category === 'newlineup') {
            // Fetch new lineup offers
            response = await offersAPI.getNewLineupOffers();
          } else {
            // Fetch offers for regular categories
            response = await offersAPI.getOffersByCategory(category);
          }
          
          setOffers(response.data || []);
          
          // Set category display name
          const categoryNames = {
            'electronics': 'Electronics & Technology',
            'fashion': 'Fashion',
            'food': 'Food & Drink',
            'beauty': 'Beauty',
            'fitness': 'Fitness',
            'education': 'Education',
            'featured': 'Hot Deals',
            'newlineup': 'New to Lineup'
          };
          setCategoryName(categoryNames[category] || category);
          
          // If view=carousel and we have offers, redirect to first offer with carousel context
          if (view === 'carousel' && response.data && response.data.length > 0) {
            const sourceMapping = {
              'featured': 'hotdeals',
              'newlineup': 'newlineup'
            };
            const source = sourceMapping[category] || 'category';
            const titleMapping = {
              'featured': 'Hot Deals',
              'newlineup': 'New to Lineup'
            };
            const title = titleMapping[category] || categoryNames[category];
            
            // Clear timeout before navigation
            clearTimeout(loadingTimeout);
            
            navigate(`/offer/${response.data[0].id}`, {
              state: { source, title },
              replace: true
            });
            return;
          }
        } else {
          // Fetch all offers from the API
          const response = await offersAPI.getAllOffers();
          
          if (response && response.offers) {
            setOffers(response.offers);
          } else {
            setOffers([]);
          }
          setCategoryName('All Offers');
        }
        
        // Clear timeout and stop loading
        clearTimeout(loadingTimeout);
        
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError('Failed to load offers. Please try again later.');
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [category]);

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  if (loading) {
    return (
      <div className="offers-page">
        <Header isLoggedIn={isLoggedIn} />
        <div className="loading-spinner">
          <p>Loading offers...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-page">
        <Header isLoggedIn={isLoggedIn} />
        <div className="error-message">
          <p>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="offers-page">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="offers-main">
        <div className="container">
          <div className="offers-header">
            <h1>{categoryName || 'All Offers'}</h1>
            <p>
              {category ? 
                `Discover amazing ${categoryName?.toLowerCase()} deals and discounts` :
                'Discover amazing deals and discounts from your favorite brands'
              }
            </p>
          </div>

          {offers.length > 0 ? (
            <div className="offers-grid">
              {offers.map((offer) => (
                <ProductCard
                  key={offer.id}
                  offer={offer}
                  onClick={() => handleOfferClick(offer.id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-offers">
              {brandId && brandName ? (
                <p>This brand has no offers available at the moment. Please check back later!</p>
              ) : (
                <p>No offers available at the moment. Please check back later!</p>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
