import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { isUserAuthenticated } from '../utils/auth';
import '../styles/Bookmarks.css';

function Bookmarks({ isLoggedIn }) {
  const navigate = useNavigate();
  const [bookmarkedOffers, setBookmarkedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Mock data for now - replace with actual API call
    const mockBookmarks = [
      {
        id: 1,
        brand: 'MISSOMA',
        discount: '15% discount',
        logo: '/images/logos/missoma.png',
        imageSrc: '/images/missoma.jpg',
        title: 'Jewelry Collection',
        description: '15% off on all jewelry'
      },
      {
        id: 2,
        brand: 'BOSS',
        discount: '20% off',
        logo: '/images/logos/boss.png',
        imageSrc: '/images/boss.jpg',
        title: 'Fashion Collection',
        description: '20% off fashion items'
      },
      {
        id: 3,
        brand: 'ARMEDANGELS',
        discount: '10% discount',
        logo: '/images/logos/armedangels.png',
        imageSrc: '/images/armedangels.jpg',
        title: 'Sustainable Fashion',
        description: '10% off selected items'
      }
    ];
    
    setTimeout(() => {
      setBookmarkedOffers(mockBookmarks);
      setLoading(false);
    }, 1000);
  }, [navigate]);

  return (
    <div className="bookmarks-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="bookmarks-content">
        <div className="bookmarks-header">
          <h1>My Saved Offers</h1>
          <p>Your favorite deals and discounts</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your saved offers...</p>
          </div>
        ) : (
          <div className="bookmarks-grid">
            {bookmarkedOffers.length > 0 ? (
              bookmarkedOffers.map((offer) => (
                <ProductCard
                  key={offer.id}
                  id={offer.id}
                  brand={offer.brand}
                  discount={offer.discount}
                  logo={offer.logo}
                  imageSrc={offer.imageSrc}
                  title={offer.title}
                  description={offer.description}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📌</div>
                <h3>No bookmarks yet</h3>
                <p>Start exploring offers and bookmark your favorites!</p>
                <button 
                  className="explore-button"
                  onClick={() => navigate('/')}
                >
                  Explore Offers
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Bookmarks;