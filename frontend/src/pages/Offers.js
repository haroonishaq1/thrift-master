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

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (category) {
          // Fetch offers for specific category
          const response = await offersAPI.getOffersByCategory(category);
          setOffers(response.data || []);
          
          // Set category display name
          const categoryNames = {
            'electronics': 'Electronics & Technology',
            'fashion': 'Fashion',
            'food': 'Food & Drink',
            'beauty': 'Beauty',
            'education': 'Education',
            'featured': 'Hot Deals'
          };
          setCategoryName(categoryNames[category] || category);
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
              <p>No offers available at the moment. Please check back later!</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
