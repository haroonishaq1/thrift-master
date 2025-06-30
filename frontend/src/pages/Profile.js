import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUserData, isUserAuthenticated } from '../utils/auth';
import '../styles/Profile.css';

function Profile({ isLoggedIn }) {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user data from localStorage
    const data = getUserData();
    if (data) {
      setUserData(data);
    }
  }, [navigate]);

  if (!userData) {
    return (
      <div className="profile-container">
        <Header isLoggedIn={isLoggedIn} />
        <div className="loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-top">
            <h2 className="profile-title">Profile Information</h2>
            <button className="edit-button">
              ✏ Edit
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="profile-avatar">
              <img 
                src="/images/avatar-placeholder.png" 
                alt="Profile"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=4c6ef5&color=fff&size=80&rounded=true&bold=true`;
                }}
              />
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
                <div className="detail-value">{userData.phone || ''}</div>
              </div>
              <div className="detail-item">
                <label>Program</label>
                <div className="detail-value">{userData.bio || userData.course || ''}</div>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <div className="detail-value">{userData.gender}</div>
              </div>
              <div className="detail-item">
                <label>Age</label>
                <div className="detail-value">
                  {userData.date_of_birth || userData.age ? `${userData.age}` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Address</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Country</label>
                <div className="detail-value">{userData.country}</div>
              </div>
              <div className="detail-item">
                <label>City/State</label>
                <div className="detail-value">{userData.city}</div>
              </div>
              <div className="detail-item">
                <label>University ID</label>
                <div className="detail-value">{userData.university || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;