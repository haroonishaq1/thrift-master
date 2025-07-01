import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OtpVerification from './pages/OtpVerification';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import OfferPage from './pages/OfferPage';
import Offers from './pages/Offers';
import RedeemedCodePage from './pages/RedeemedCodePage';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Bookmarks from './pages/Bookmarks';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

// Forgot Password Routes
import ForgotPassword from './pages/ForgotPassword';
import ForgotPasswordOtpVerification from './pages/ForgotPasswordOtpVerification';
import ResetPassword from './pages/ResetPassword';

// Brand Admin Panel Routes
import BrandRegisterStep1 from './pages/brand/BrandRegisterStep1';
import BrandRegisterStep2 from './pages/brand/BrandRegisterStep2';
import BrandOtpVerification from './pages/brand/BrandOtpVerification';
import BrandLogin from './pages/brand/BrandLogin';
import BrandForgotPassword from './pages/brand/BrandForgotPassword';
import BrandForgotPasswordOtpVerification from './pages/brand/BrandForgotPasswordOtpVerification';
import BrandResetPassword from './pages/brand/BrandResetPassword';
import BrandDashboard from './pages/brand/BrandDashboard';
import BrandOffers from './pages/brand/BrandOffers';
import BrandAddOffer from './pages/brand/BrandAddOffer';
import BrandAnalytics from './pages/brand/BrandAnalytics';
import OfferDebugger from './pages/brand/OfferDebugger';

// Admin Panel Routes
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Brand Layout
import BrandLayout from './components/brand/BrandLayout';

// Import authentication utilities
import { isUserAuthenticated } from './utils/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isUserAuthenticated();
      setIsLoggedIn(authenticated);
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Function to update login status (can be called from child components)
  const updateAuthStatus = () => {
    setIsLoggedIn(isUserAuthenticated());
  };
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* User/Consumer Routes */}
          <Route path="/login" element={<Login updateAuthStatus={updateAuthStatus} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-otp" element={<OtpVerification updateAuthStatus={updateAuthStatus} />} />
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/offers" element={<Offers isLoggedIn={isLoggedIn} />} />
          <Route path="/brand/:brandName" element={<BrandPage isLoggedIn={isLoggedIn} />} />
          <Route path="/offer/:offerId" element={<OfferPage isLoggedIn={isLoggedIn} />} />
          <Route path="/redeem-code/:offerId" element={<RedeemedCodePage isLoggedIn={isLoggedIn} />} />
          
          {/* User Profile Routes */}
          <Route path="/my-profile" element={<Profile isLoggedIn={isLoggedIn} />} />
          <Route path="/edit-profile" element={<EditProfile isLoggedIn={isLoggedIn} />} />
          <Route path="/my-bookmarks" element={<Bookmarks isLoggedIn={isLoggedIn} />} />
          <Route path="/my-orders" element={<Orders isLoggedIn={isLoggedIn} />} />
          <Route path="/settings" element={<Settings isLoggedIn={isLoggedIn} />} />
          <Route path="/help" element={<Help isLoggedIn={isLoggedIn} />} />
          
          {/* Forgot Password Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/verify-otp" element={<ForgotPasswordOtpVerification />} />
          <Route path="/forgot-password/reset" element={<ResetPassword />} />
          
          {/* Brand Admin Panel Routes - Public */}
          <Route path="/brand/register/step1" element={<BrandRegisterStep1 />} />
          <Route path="/brand/register/step2" element={<BrandRegisterStep2 />} />
          <Route path="/brand/verify-otp" element={<BrandOtpVerification />} />
          <Route path="/brand/login" element={<BrandLogin />} />
          
          {/* Brand Forgot Password Routes */}
          <Route path="/brand/forgot-password" element={<BrandForgotPassword />} />
          <Route path="/brand/forgot-password/verify-otp" element={<BrandForgotPasswordOtpVerification />} />
          <Route path="/brand/forgot-password/reset" element={<BrandResetPassword />} />
          
          {/* Brand Admin Panel Routes - Protected with Sidebar */}
          <Route path="/brand/dashboard" element={<BrandLayout><BrandDashboard /></BrandLayout>} />
          <Route path="/brand/offers" element={<BrandLayout><BrandOffers /></BrandLayout>} />
          <Route path="/brand/add-offer" element={<BrandLayout><BrandAddOffer /></BrandLayout>} />
          <Route path="/brand/analytics" element={<BrandLayout><BrandAnalytics /></BrandLayout>} />
          <Route path="/brand/debug" element={<BrandLayout><OfferDebugger /></BrandLayout>} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* 404 Not Found Route - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
