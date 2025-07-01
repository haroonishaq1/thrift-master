const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  logout,
  updateProfile,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword
} = require('../controllers/brandAuthController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/forgot-password/verify-otp', asyncHandler(verifyForgotPasswordOTP));
router.post('/reset-password', asyncHandler(resetPassword));

// Protected routes
router.get('/profile', authenticateToken, asyncHandler(getProfile));
router.put('/profile', authenticateToken, asyncHandler(updateProfile));
router.put('/change-password', authenticateToken, asyncHandler(changePassword));

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Brand auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
