const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer storage config for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/brands'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  getProfile,
  updateProfile,
  brandRegister,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const {
  validateRegistration,
  validateOTPVerification,
  validateResendOTP,
  validateLogin
} = require('../middleware/validation');
const { authenticateToken, requireVerified } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
router.post('/register', validateRegistration, asyncHandler(register));
router.post('/verify-otp', validateOTPVerification, asyncHandler(verifyOTP));
router.post('/resend-otp', validateResendOTP, asyncHandler(resendOTP));
router.post('/login', validateLogin, asyncHandler(login));

// Forgot Password routes
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/verify-forgot-password-otp', asyncHandler(verifyForgotPasswordOTP));
router.post('/reset-password', asyncHandler(resetPassword));

// Brand routes (also available at /brand-auth/register via alias)
// Accept logoImage as a single file (field name from frontend FormData)
router.post('/brand/register', upload.single('logoImage'), asyncHandler(brandRegister));

// Protected routes
router.get('/profile', authenticateToken, requireVerified, asyncHandler(getProfile));
router.put('/profile', authenticateToken, requireVerified, asyncHandler(updateProfile));
router.put('/change-password', authenticateToken, requireVerified, asyncHandler(changePassword));

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
