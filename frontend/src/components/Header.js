import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearUserAuth } from '../utils/auth';
import { offersAPI } from '../services/api';
import { CATEGORIES } from '../constants/categories';
import '../styles/Header.css';

function Header({ isLoggedIn }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Import categories from shared constants
  const categories = CATEGORIES;

  const handleCategoryClick = (categoryValue) => {
    // Categories that are shown on Home page (should scroll to section)
    const categoriesOnHomePage = ['electronics', 'fashion', 'food'];
    
    // Categories that are NOT on Home page (should navigate to offers page)
    const categoriesNotOnHomePage = ['fitness', 'beauty', 'education'];
    
    if (categoriesNotOnHomePage.includes(categoryValue)) {
      // Navigate directly to offers page for categories not shown on home
      navigate(`/offers?category=${categoryValue}`);
      return;
    }
    
    if (categoriesOnHomePage.includes(categoryValue)) {
      // If not on home page, navigate to home first
      if (window.location.pathname !== '/') {
        navigate('/', { state: { scrollToCategory: categoryValue } });
        return;
      }
      
      // If on home page, scroll to the category section
      scrollToCategorySection(categoryValue);
    }
  };

  const scrollToCategorySection = (categoryValue) => {
    // Map category values to section IDs (only for categories shown on Home page)
    const categoryToSectionId = {
      'food': 'food-drink-section',
      'electronics': 'electronics-section',
      'fashion': 'fashion-section'
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

  const handleSearchInput = async (value) => {
    setSearchTerm(value);
    setNoResultsFound(false);
    
    if (value.trim().length >= 2) {
      try {
        const response = await offersAPI.searchBrands(value.trim(), showMoreBrands ? 20 : 5);
        const results = response.data || [];
        setBrandSuggestions(results);
        setShowSuggestions(true);
        setNoResultsFound(results.length === 0);
      } catch (error) {
        console.error('Error searching brands:', error);
        setBrandSuggestions([]);
        setNoResultsFound(true);
      }
    } else {
      setBrandSuggestions([]);
      setShowSuggestions(false);
      setNoResultsFound(false);
    }
  };

  const handleBrandSuggestionClick = async (brandId, brandName) => {
    try {
      // Get offers for this brand
      const response = await offersAPI.getOffersByBrandId(brandId);
      const brandOffers = response.data || [];
      
      if (brandOffers.length > 0) {
        // Navigate with brand context
        navigate(`/offer/${brandOffers[0].id}`, { 
          state: { 
            source: 'brand', 
            title: brandName 
          } 
        });
      } else {
        // If no offers, navigate to offers page with brand info
        navigate(`/offers?brand_id=${brandId}&brand_name=${encodeURIComponent(brandName)}`);
      }
      
      // Clear search
      setSearchTerm('');
      setShowSuggestions(false);
      setShowMoreBrands(false);
      setNoResultsFound(false);
    } catch (error) {
      console.error('Error fetching offers for brand:', error);
      navigate('/offers');
    }
  };

  const handleShowMoreBrands = async () => {
    setShowMoreBrands(true);
    if (searchTerm.trim().length >= 2) {
      try {
        const response = await offersAPI.searchBrands(searchTerm.trim(), 20);
        const results = response.data || [];
        setBrandSuggestions(results);
        setNoResultsFound(results.length === 0);
      } catch (error) {
        console.error('Error fetching more brands:', error);
        setNoResultsFound(true);
      }
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() && !noResultsFound) {
      const searchQuery = searchTerm.trim();
      
      try {
        // First check if there are any exact matches (case insensitive)
        const response = await offersAPI.searchBrands(searchQuery, 20);
        const matchingBrands = response.data || [];
        
        // If no brands found, don't navigate
        if (matchingBrands.length === 0) {
          return;
        }
        
        // Look for exact match (case insensitive)
        const exactMatch = matchingBrands.find(brand => 
          brand.name.toLowerCase() === searchQuery.toLowerCase()
        );
        
        if (exactMatch) {
          // Navigate to brand offers if exact match found
          const offersResponse = await offersAPI.getOffersByBrandId(exactMatch.id);
          const brandOffers = offersResponse.data || [];
          
          if (brandOffers.length > 0) {
            navigate(`/offer/${brandOffers[0].id}`, { 
              state: { 
                source: 'brand', 
                title: exactMatch.name 
              } 
            });
          } else {
            // If brand has no offers, navigate to offers page with brand info
            navigate(`/offers?brand_id=${exactMatch.id}&brand_name=${encodeURIComponent(exactMatch.name)}`);
          }
        } else {
          // No exact match, don't navigate
          return;
        }
      } catch (error) {
        console.error('Error during search:', error);
        // Don't navigate on error
        return;
      }
      
      // Clear search
      setSearchTerm('');
      setShowSuggestions(false);
      setShowMoreBrands(false);
      setNoResultsFound(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowMoreBrands(false);
        setNoResultsFound(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <div className="search-container" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input 
                type="text" 
                placeholder="e.g. Apple, Samsung..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
              <button type="submit" className="search-button">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
                  <line x1="14.4142" y1="14" x2="19" y2="18.5858" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </form>
            
            {/* Brand Suggestions */}
            {showSuggestions && (
              <div className="brand-suggestions">
                {brandSuggestions.length > 0 ? (
                  <>
                    <ul>
                      {brandSuggestions.slice(0, showMoreBrands ? undefined : 5).map((brand) => (
                        <li key={brand.id}>
                          <button 
                            onClick={() => handleBrandSuggestionClick(brand.id, brand.name)} 
                            className="brand-suggestion-item"
                          >
                            {brand.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Show More button */}
                    {!showMoreBrands && brandSuggestions.length > 5 && (
                      <button onClick={handleShowMoreBrands} className="show-more-brands">
                        Show More
                      </button>
                    )}
                  </>
                ) : (
                  <div className="no-results">
                    <p>No items available</p>
                    <small>No brands found matching "{searchTerm}"</small>
                  </div>
                )}
              </div>
            )}
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
