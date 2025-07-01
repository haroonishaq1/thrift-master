import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUserData, isUserAuthenticated, storeUserAuth } from '../utils/auth';
import { authAPI } from '../services/api';
import '../styles/Profile.css';

function Profile({ isLoggedIn }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if user is authenticated
        if (!isUserAuthenticated()) {
          navigate('/login');
          return;
        }

        setIsLoading(true);

        // Check if we have updated data from navigation state
        const forceRefresh = location.state?.forceRefresh;
        const updatedData = location.state?.updatedData;

        if (forceRefresh && updatedData) {
          console.log('🔍 Profile: Using updated user data from edit page:', updatedData);
          setUserData(updatedData);
          setIsLoading(false);
          return;
        }

        // First, try to get data from localStorage (from login)
        const localUserData = getUserData();
        console.log('🔍 Profile: localStorage user data:', localUserData);
        
        if (localUserData) {
          console.log('🔍 Profile: Using localStorage data');
          setUserData(localUserData);
          setIsLoading(false);
          return;
        }

        // If no localStorage data, try API as fallback
        try {
          console.log('🔍 Profile: No localStorage data, fetching from API...');
          const profileResponse = await authAPI.getProfile();
          console.log('🔍 Profile: API response:', profileResponse);
          
          if (profileResponse.success && profileResponse.data) {
            const freshUserData = profileResponse.data.user || profileResponse.data;
            console.log('✅ Profile: Fresh user profile data from API:', freshUserData);
            setUserData(freshUserData);
            
            // Update localStorage with fresh data
            const token = localStorage.getItem('userToken');
            if (token) {
              storeUserAuth(token, freshUserData);
              console.log('✅ Profile: Updated localStorage with fresh user data');
            }
          }
        } catch (apiError) {
          console.error('❌ Profile: API fetch failed:', apiError.message);
          // If everything fails, show error
          setUserData(null);
        }
      } catch (err) {
        console.error('❌ Profile: Error in fetchUserProfile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, location.state]);

  if (!userData || isLoading) {
    return (
      <div className="profile-container">
        <Header isLoggedIn={isLoggedIn} />
        <div className="loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  // Debug logging
  console.log('🔍 Profile.js userData:', userData);
  console.log('🔍 Profile.js userData.age:', userData.age, typeof userData.age);
  console.log('🔍 Profile.js userData.gender:', userData.gender, typeof userData.gender);
  console.log('🔍 Profile.js userData.country:', userData.country, typeof userData.country);
  console.log('🔍 Profile.js userData.city:', userData.city, typeof userData.city);

  return (
    <div className="profile-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-top">
            <h2 className="profile-title">Profile Information</h2>
            <button 
              className="edit-button"
              onClick={() => navigate('/edit-profile')}
            >
              Edit
            </button>
          </div>
          <div className="profile-user-section">
            <div className="profile-avatar">
              <div className="profile-icon">
                <div className="person-icon"></div>
              </div>
            </div>
            <div className="profile-info">
              <h1>{userData.first_name} {userData.last_name}</h1>
              <p className="profile-subtitle">{userData.university || 'Student'}</p>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Personal Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>First Name</label>
                <div className="detail-value">{userData.first_name}</div>
              </div>
              <div className="detail-item">
                <label>Last Name</label>
                <div className="detail-value">{userData.last_name}</div>
              </div>
              <div className="detail-item">
                <label>Email address</label>
                <div className="detail-value">{userData.email}</div>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <div className="detail-value">
                  {userData.phone ? userData.phone : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
              <div className="detail-item">
                <label>Program</label>
                <div className="detail-value">
                  {userData.bio || userData.course ? (userData.bio || userData.course) : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <div className="detail-value">
                  {userData.gender ? userData.gender : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
              <div className="detail-item">
                <label>Age</label>
                <div className="detail-value">
                  {userData.age ? `${userData.age}` : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Address</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Country</label>
                <div className="detail-value">
                  {userData.country ? userData.country : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
              <div className="detail-item">
                <label>City/State</label>
                <div className="detail-value">
                  {userData.city ? userData.city : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
              <div className="detail-item">
                <label>University ID</label>
                <div className="detail-value">
                  {userData.university ? userData.university : <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              className="change-password-button"
              onClick={() => navigate('/change-password')}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;