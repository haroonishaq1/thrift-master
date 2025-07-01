const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { brandRegister, brandLogin, verifyBrandOTP, resendBrandOTP } = require('../controllers/authController');
const { forgotPassword, verifyForgotPasswordOTP, resetPassword, logout, getProfile, updateProfile } = require('../controllers/brandAuthController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Create brands upload directory if it doesn't exist
const brandsUploadDir = path.join(__dirname, '../../uploads/brands');
if (!fs.existsSync(brandsUploadDir)) {
  fs.mkdirSync(brandsUploadDir, { recursive: true });
  console.log('📁 Created brands upload directory');
}

// Multer storage config for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, brandsUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Brand auth routes - these are the exact routes the frontend expects
router.post('/register', upload.single('logoImage'), asyncHandler(brandRegister));
router.post('/verify-otp', asyncHandler(verifyBrandOTP));
router.post('/resend-otp', asyncHandler(resendBrandOTP));
router.post('/login', asyncHandler(brandLogin));
router.post('/logout', asyncHandler(logout));
router.get('/profile', authenticateToken, asyncHandler(getProfile));
router.put('/profile', authenticateToken, asyncHandler(updateProfile));

// Brand forgot password routes
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/forgot-password/verify-otp', asyncHandler(verifyForgotPasswordOTP));
router.post('/reset-password', asyncHandler(resetPassword));

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Brand auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
