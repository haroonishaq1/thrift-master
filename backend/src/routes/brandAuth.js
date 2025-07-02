const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  logout,
  verifyRegistrationOTP,
  updateProfile,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  changePassword
} = require('../controllers/brandAuthController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/brands/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.post('/register', upload.single('logoImage'), asyncHandler(register));
router.post('/verify-otp', asyncHandler(verifyRegistrationOTP));
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
