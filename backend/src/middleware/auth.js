const jwt = require('jsonwebtoken');
const { sendErrorResponse } = require('../utils/helpers');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendErrorResponse(res, 'Access token required', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return sendErrorResponse(res, 'Token has expired', 401);
        }
        return sendErrorResponse(res, 'Invalid token', 403);
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendErrorResponse(res, 'Authentication failed', 500);
  }
};

/**
 * Middleware to verify JWT token for optional authentication
 * (doesn't fail if no token provided)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user is verified
 */
const requireVerified = async (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401);
  }

  // If email_verified is not in the token (old tokens), fetch from database
  if (req.user.email_verified === undefined) {
    try {
      const { User } = require('../models/User');
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return sendErrorResponse(res, 'User not found', 404);
      }
      
      if (!user.email_verified) {
        return sendErrorResponse(res, 'Email verification required', 403);
      }
      
      // Add email_verified to req.user for this request
      req.user.email_verified = user.email_verified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return sendErrorResponse(res, 'Verification check failed', 500);
    }
  } else if (!req.user.email_verified) {
    return sendErrorResponse(res, 'Email verification required', 403);
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVerified
};
