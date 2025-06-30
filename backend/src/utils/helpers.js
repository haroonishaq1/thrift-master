const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time
const getOTPExpiry = () => {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
  return expiry;
};

// Format response
const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate university email (basic check)
const isUniversityEmail = (email) => {
  const universityDomains = [
    '.edu', '.ac.', '.edu.', '.university.', '.uni-', '.univ-'
  ];
  return universityDomains.some(domain => email.toLowerCase().includes(domain));
};

// Send error response helper
const sendErrorResponse = (res, message, statusCode = 500, data = null) => {
  return res.status(statusCode).json(formatResponse(false, message, data));
};

module.exports = {
  generateToken,
  verifyToken,
  generateOTP,
  getOTPExpiry,
  formatResponse,
  sendErrorResponse,
  isValidEmail,
  isUniversityEmail
};
