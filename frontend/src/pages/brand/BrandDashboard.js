import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isBrandAuthenticated, clearBrandAuth } from '../../utils/auth';
import { offersAPI } from '../../services/api';
import '../../styles/brand/BrandDashboard.css';

function BrandDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestOffers, setLatestOffers] = useState([]);
  
  // Check authentication and redirect
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
      return;
    }
  }, [navigate]);

  // Calculate stats from offers
  const calculateStats = (offersData) => {
    const total = offersData.length;
    let active = 0;
    let expired = 0;
    let rejected = 0;
    
    offersData.forEach(offer => {
      const now = new Date();
      const isExpired = offer.valid_until ? new Date(offer.valid_until) < now : false;
      // Handle both field name variations
      const isApproved = offer.isApproved || offer.isapproved;
      
      if (offer.status === 'rejected') {
        rejected++;
      } else if (isExpired || offer.status === 'expired') {
        expired++;
      } else if (offer.status === 'active' && isApproved) {
        active++;
      }
    });
    
    return { total, active, expired, rejected };
  };

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        if (!isBrandAuthenticated()) {
          throw new Error('You are not authenticated. Please login again.');
        }

        const data = await offersAPI.getBrandOffers();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch dashboard data');
        }
        
        // Calculate stats
        const calculatedStats = calculateStats(data.data);
        setStats(calculatedStats);
        
        // Get latest 3 offers
        const sortedOffers = [...data.data].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setLatestOffers(sortedOffers.slice(0, 3));
        
        console.log('✅ Dashboard data loaded successfully');
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError(err.message);
        
        if (err.message.includes('authentication') || err.message.includes('token')) {
          clearBrandAuth();
          navigate('/brand/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="brand-dashboard">
        <div className="loading-container">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-dashboard">
        <div className="error-container">
          <div className="error-message">
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-dashboard">
      <div className="dashboard-header">
        <h1>Brand Dashboard</h1>
        <p>Welcome back! Here's an overview of your offers.</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Offers</div>
        </div>
        <div className="stat-card active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active Offers</div>
        </div>
        <div className="stat-card expired">
          <div className="stat-number">{stats.expired}</div>
          <div className="stat-label">Expired Offers</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected Offers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/brand/add-offer')}
          >
            + Add New Offer
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/brand/offers')}
          >
            View All Offers
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/brand/analytics')}
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Recent Offers */}
      <div className="recent-offers">
        <h3>Recent Offers</h3>
        {latestOffers.length === 0 ? (
          <div className="no-offers">
            <p>No offers created yet.</p>
            <button 
              className="create-first-offer-btn"
              onClick={() => navigate('/brand/add-offer')}
            >
              Create Your First Offer
            </button>
          </div>
        ) : (
          <div className="offers-list">
            {latestOffers.map(offer => {
              const isExpired = offer.valid_until ? new Date(offer.valid_until) < new Date() : false;
              const isApproved = offer.isApproved || offer.isapproved;
              const isRejected = offer.status === 'rejected';
              
              // Determine status for display
              let statusDisplay = 'Inactive';
              let statusClass = 'inactive';
              
              if (isRejected) {
                statusDisplay = 'Rejected';
                statusClass = 'rejected';
              } else if (isExpired || offer.status === 'expired') {
                statusDisplay = 'Expired';
                statusClass = 'expired';
              } else if (isApproved && offer.status === 'active') {
                statusDisplay = 'Active';
                statusClass = 'active';
              }
              
              return (
                <div key={offer.id} className={`offer-item ${statusClass}`}>
                  <div className="offer-info">
                    <h4>{offer.title}</h4>
                    <p>{offer.discount_percent}% off</p>
                    <span className={`status ${statusClass}`}>
                      {statusDisplay}
                    </span>
                  </div>
                  <div className="offer-date">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandDashboard;
