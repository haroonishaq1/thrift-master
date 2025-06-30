import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isBrandAuthenticated, clearBrandAuth } from '../../utils/auth';
import { offersAPI } from '../../services/api';
import '../../styles/brand/BrandOffers.css';

function BrandOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });    // Check for token and redirect to login if not present
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
    }
  }, [navigate]);

  // Calculate stats from offers
  const calculateStats = (offersData) => {
    const total = offersData.length;
    let active = 0;
    let expired = 0;
    
    offersData.forEach(offer => {
      const now = new Date();
      const isExpired = offer.valid_until ? new Date(offer.valid_until) < now : false;
      
      if (isExpired || offer.status === 'expired') {
        expired++;
      } else if (offer.status === 'active') {
        active++;
      }
    });
    
    return { total, active, expired };
  };

  // Load offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        
        // Check authentication using our utility function
        if (!isBrandAuthenticated()) {
          throw new Error('You are not authenticated. Please login again.');
        }

        // Use the API service function
        const data = await offersAPI.getBrandOffers();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch offers');
        }
        
        setOffers(data.data);
        
        // Calculate and set stats
        const calculatedStats = calculateStats(data.data);
        setStats(calculatedStats);
        
        console.log('✅ Offers loaded successfully:', data.data);
        console.log('📊 Stats calculated:', calculatedStats);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching offers:', err);
        setError(err.message);
        
        // Handle authentication errors
        if (err.message.includes('authentication') || err.message.includes('token')) {
          clearBrandAuth();
          navigate('/brand/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, []);
  
  const handleAddOffer = () => {
    navigate('/brand/add-offer');
  };  // Check if the latest offer has expired
  const isLatestOfferExpired = () => {
    if (offers.length === 0) return true;
    
    // Sort offers by creation date (newest first)
    const sortedOffers = [...offers].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    const latestOffer = sortedOffers[0];
    const now = new Date();
    const expiryDate = new Date(latestOffer.end_date);
    
    return now > expiryDate || latestOffer.current_status === 'expired';
  };  // Delete an offer
  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) {
      return;
    }
    
    try {
      // Get the offer being deleted (for updating stats later)
      const offerToDelete = offers.find(offer => offer.id === offerId);
      if (!offerToDelete) {
        throw new Error('Offer not found');
      }
      
      // Get the token
      const token = localStorage.getItem('brand-token');
      if (!token) {
        throw new Error('You are not authenticated. Please login again.');
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/offers/${offerId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Handle non-2xx responses
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('brand-token');
          localStorage.removeItem('brand-data');
          navigate('/brand/login');
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete offer');
      }
      
      // Update state with removed offer
      const updatedOffers = offers.filter(offer => offer.id !== offerId);
      setOffers(updatedOffers);
      
      // Recalculate stats
      const updatedStats = calculateStats(updatedOffers);
      setStats(updatedStats);
      
      console.log('✅ Offer deleted successfully');
      console.log('📊 Updated stats:', updatedStats);
      
    } catch (error) {
      console.error('Error deleting offer:', error);
      setError(error.message || 'Failed to delete offer');
    }
  };
  // Format date to a readable string with time
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
    return (
    <div className="brand-offers-container">
      <div className="brand-offers-header">
        <h2>Your Offers</h2>
        <div className="offers-stats">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Expired: {stats.expired}</span>
        </div>
        <button 
          className={`add-offer-button ${!isLatestOfferExpired() ? 'disabled' : ''}`}
          onClick={isLatestOfferExpired() ? handleAddOffer : undefined}
          title={!isLatestOfferExpired() ? "You can only add a new offer after your latest offer expires (24 hours)" : ""}
          disabled={!isLatestOfferExpired() || isLoading}
        >
          Add New Offer
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}        {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="no-offers-message">
          <p>You haven't created any offers yet.</p>
          <button 
            className="create-first-offer-button" 
            onClick={handleAddOffer}
          >
            Create Your First Offer
          </button>
        </div>
      ) : (<div className="offers-table-container">
          <table className="offers-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Offer Name</th>
                <th>Discount</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>              {isLoading ? (
                <tr>
                  <td colSpan="9" className="loading-cell">Loading offers...</td>
                </tr>
              ) : offers.map(offer => {
                const isExpired = offer.current_status === 'expired';
                
                return (
                  <tr key={offer.id} className={isExpired ? 'expired-offer' : ''}>
                    <td className="offer-image-cell">
                      {offer.image_url ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${offer.image_url}`} 
                          alt={offer.title}
                          className="offer-thumbnail" 
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </td>
                    <td>{offer.title}</td>
                    <td>{offer.discount_percent}%</td>
                    <td className="description-cell">
                      {offer.description.length > 50 
                        ? `${offer.description.substring(0, 50)}...` 
                        : offer.description}
                    </td>
                    <td>{formatDate(offer.created_at)}</td>
                    <td>{formatDate(offer.end_date)}</td>
                    <td className={`status-cell ${isExpired ? 'expired' : 'active'}`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </td>
                    <td className={`approval-status-cell ${offer.isapproved ? 'approved' : 'pending'}`}>
                      {offer.isapproved ? 'Approved' : 'Pending'}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteOffer(offer.id)}
                        title="Delete this offer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BrandOffers;
