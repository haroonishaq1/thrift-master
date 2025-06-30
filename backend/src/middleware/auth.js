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
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401);
  }

  if (!req.user.email_verified) {
    return sendErrorResponse(res, 'Email verification required', 403);
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVerified
};
