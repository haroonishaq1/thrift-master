import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearUserAuth } from '../utils/auth';
import '../styles/Header.css';

function Header({ isLoggedIn }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: 'Food & Drink', value: 'food' },
    { name: 'Fitness', value: 'fitness' },
    { name: 'Technology', value: 'electronics' },
    { name: 'Beauty', value: 'beauty' },
    { name: 'Fashion', value: 'fashion' },
    { name: 'Education', value: 'education' },
    { name: 'ALL', value: 'all' }
  ];

  const handleCategoryClick = (categoryValue) => {
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollToCategory: categoryValue } });
      return;
    }
    
    // If on home page, scroll to the category section
    scrollToCategorySection(categoryValue);
  };

  const scrollToCategorySection = (categoryValue) => {
    // Map category values to section IDs
    const categoryToSectionId = {
      'food': 'food-drink-section',
      'fitness': 'fitness-section', // We'll need to add this ID
      'electronics': 'electronics-section',
      'beauty': 'beauty-section',
      'fashion': 'fashion-section',
      'education': 'education-section',
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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  const closeHamburgerMenu = () => {
    setShowHamburgerMenu(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  const handleProfileLogout = () => {
    clearUserAuth();
    setShowProfileDropdown(false);
    // Force a page reload to update the authentication state
    window.location.href = '/';
  };

  const handleLogout = () => {
    clearUserAuth();
    setShowMenu(false);
    setShowHamburgerMenu(false);
    // Force a page reload to update the authentication state
    window.location.href = '/';
  };

  const UserAvatar = () => (
    <div className="user-profile">
      <button className="profile-button" onClick={toggleMenu}>
        <div className="avatar-placeholder">
          👤
        </div>
      </button>
      {showMenu && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span>Your Thrift account</span>
          </div>
          <ul>
            <li><Link to="/my-profile">My Profile</Link></li>
            <li><button onClick={handleLogout} className="logout-button">Log Out</button></li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <header className="header">
      <div className="header-container">
        {/* Left - Hamburger Menu (only when not logged in) or Profile Icon (when logged in) */}
        <div className="hamburger-menu-section">
          {!isLoggedIn ? (
            <>
              <button 
                className={`hamburger-button ${showHamburgerMenu ? 'active' : ''}`} 
                onClick={toggleHamburgerMenu}
              >
                <span>☰</span>
              </button>
              
              {/* Backdrop */}
              {showHamburgerMenu && (
                <div 
                  className={`menu-backdrop ${showHamburgerMenu ? 'show' : ''}`}
                  onClick={closeHamburgerMenu}
                />
              )}
              
              <div className={`hamburger-menu ${showHamburgerMenu ? 'show' : ''}`}>
                <div className="hamburger-menu-header">
                  <span>Menu</span>
                  <button className="close-menu" onClick={closeHamburgerMenu}>✕</button>
                </div>
                <ul className="hamburger-menu-items">
                  <li><Link to="/signup" onClick={closeHamburgerMenu}>Sign Up</Link></li>
                  <li><Link to="/login" onClick={closeHamburgerMenu}>Login</Link></li>
                  <li><Link to="/brand/register/step1" onClick={closeHamburgerMenu}>Brand Register</Link></li>
                  <li><Link to="/brand/login" onClick={closeHamburgerMenu}>Brand Login</Link></li>
                </ul>
              </div>
            </>
          ) : (
            <div className="profile-section">
              <button 
                className="profile-icon-button" 
                onClick={toggleProfileDropdown}
              >
                <div className="profile-icon">
                  <div className="person-icon"></div>
                </div>
              </button>
              
              {/* Profile Backdrop */}
              {showProfileDropdown && (
                <div 
                  className="profile-backdrop"
                  onClick={closeProfileDropdown}
                />
              )}
              
              {/* Profile Dropdown - always rendered like hamburger menu */}
              <div className={`profile-dropdown ${showProfileDropdown ? 'show' : ''}`}>
                <ul className="profile-dropdown-items">
                  <li>
                    <Link to="/my-profile" onClick={closeProfileDropdown}>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleProfileLogout} className="logout-button">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Center - Logo */}
        <div className="logo-center">
          <Link to="/">
            <h1>Thrift</h1>
          </Link>
        </div>

        {/* Right - Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <input type="text" placeholder="e.g. Zalando..." className="search-input" />
            <button className="search-button">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
                <line x1="14.4142" y1="14" x2="19" y2="18.5858" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Categories */}
      <nav style={{
        backgroundColor: 'transparent',
        padding: '0',
        margin: '0',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px',
          padding: '12px 0 2px 0',
          width: '100%',
          margin: '0',
          overflowX: 'auto'
        }}>
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category.value)}
              style={{
                background: 'none',
                border: 'none',
                color: '#000',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '2px 12px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                minWidth: 'auto'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#4361ee';
                e.target.style.backgroundColor = '#f8f9ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#000';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;
