import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isUserAuthenticated } from '../utils/auth';
import '../styles/Profile.css';

function Orders({ isLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="profile-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Orders</h1>
          <p>Track your orders and purchase history</p>
        </div>

        <div className="orders-content">
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Start shopping and your orders will appear here!</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Orders;