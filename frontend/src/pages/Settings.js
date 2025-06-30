import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isUserAuthenticated } from '../utils/auth';
import '../styles/Profile.css';

function Settings({ isLoggedIn }) {
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
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Account Settings</h3>
            <div className="settings-item">
              <label>Email Notifications</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="settings-item">
              <label>SMS Notifications</label>
              <input type="checkbox" />
            </div>
            <div className="settings-item">
              <label>Marketing Emails</label>
              <input type="checkbox" defaultChecked />
            </div>
          </div>

          <div className="settings-section">
            <h3>Privacy Settings</h3>
            <div className="settings-item">
              <label>Profile Visibility</label>
              <select defaultValue="public">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Settings;