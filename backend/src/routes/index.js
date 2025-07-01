const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const brandAuthRoutes = require('./brandAuth');
const adminRoutes = require('./admin');
const offersRoutes = require('./offers');
const contactRoutes = require('./contact');

// Use route modules
router.use('/auth', authRoutes);
router.use('/brand-auth', brandAuthRoutes);
router.use('/admin', adminRoutes);
router.use('/offers', offersRoutes);
router.use('/contact', contactRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Project Thrift API',
    version: '1.0.0',    endpoints: {
      auth: '/api/auth',
      brandAuth: '/api/brand-auth',
      admin: '/api/admin',
      offers: '/api/offers',
      health: '/api/auth/health',
      brandHealth: '/api/brand-auth/health',
      adminHealth: '/api/admin/health'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
