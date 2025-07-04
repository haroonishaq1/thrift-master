const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getPendingBrands,
  getAllBrands,
  approveBrand,
  rejectBrand,
  getDashboardStats,
  getPendingOffers,
  approveOffer,
  rejectOffer
} = require('../controllers/adminController');
const { asyncHandler } = require('../middleware/errorHandler');

// Admin authentication
router.post('/login', asyncHandler(adminLogin));

// Admin dashboard and brand management
router.get('/dashboard/stats', asyncHandler(getDashboardStats));
router.get('/brands/pending', asyncHandler(getPendingBrands));
router.get('/brands/all', asyncHandler(getAllBrands));

// Brand approval actions
router.post('/brands/:brandId/approve', asyncHandler(approveBrand));
router.post('/brands/:brandId/reject', asyncHandler(rejectBrand));

// Offer management and approval
router.get('/offers/pending', asyncHandler(getPendingOffers));
router.post('/offers/:offerId/approve', asyncHandler(approveOffer));
router.post('/offers/:offerId/reject', asyncHandler(rejectOffer));

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
