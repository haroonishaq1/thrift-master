const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Offer } = require('../models/Offer');
const { authMiddleware } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/offers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `offer-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg, .webp, and .svg files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to verify brand authentication
const verifyBrandAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header received:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token extracted:', token);
    console.log('🔍 Token type:', typeof token);
    console.log('🔍 Token length:', token.length);
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Invalid token value');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('✅ Token decoded:', decoded);

    if (decoded.type !== 'brand') {
      console.log('❌ Not a brand token');
      return res.status(403).json({
        success: false,
        message: 'Brand access required'
      });
    }

    req.brandId = decoded.id;
    req.brandEmail = decoded.email;
    console.log('✅ Brand authenticated:', req.brandId, req.brandEmail);
    next();
  } catch (error) {
    console.error('Brand auth verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// GET /api/offers - Get all offers (public view) or brand-specific offers
router.get('/', async (req, res) => {
  try {
    const { category, brand_id, limit, public_view } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (brand_id) filters.brand_id = parseInt(brand_id);
    if (limit) filters.limit = parseInt(limit);
    if (public_view === 'true') filters.publicView = true;

    const offers = await Offer.getAll(filters);

    res.json({
      success: true,
      data: offers,
      message: `Retrieved ${offers.length} offers`
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve offers',
      error: error.message
    });
  }
});

// GET /api/offers/brand - Get offers for authenticated brand
router.get('/brand', verifyBrandAuth, async (req, res) => {
  try {
    const offers = await Offer.getByBrandId(req.brandId);
    
    console.log('🔍 Retrieved offers for brand:', req.brandId);
    console.log('🔍 Number of offers:', offers.length);
    if (offers.length > 0) {
      console.log('🔍 Sample offer data:', JSON.stringify(offers[0], null, 2));
    }

    res.json({
      success: true,
      data: offers,
      message: `Retrieved ${offers.length} offers for your brand`
    });
  } catch (error) {
    console.error('Error fetching brand offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your offers',
      error: error.message
    });
  }
});

// GET /api/offers/featured - Get featured offers
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const offers = await Offer.getFeatured(limit);

    res.json({
      success: true,
      data: offers,
      message: `Retrieved ${offers.length} featured offers`
    });
  } catch (error) {
    console.error('Error fetching featured offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured offers',
      error: error.message
    });
  }
});

// GET /api/offers/brands - Get all unique brands
router.get('/brands', async (req, res) => {
  try {
    const { Brand } = require('../models/Brand');
    const brands = await Brand.getAllBrands();

    res.json({
      success: true,
      data: brands,
      message: `Retrieved ${brands.length} brands`
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve brands',
      error: error.message
    });
  }
});

// GET /api/offers/category/:category - Get offers by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const offers = await Offer.getByCategory(category);

    res.json({
      success: true,
      data: offers,
      message: `Retrieved ${offers.length} offers in ${category} category`
    });
  } catch (error) {
    console.error('Error fetching offers by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve offers by category',
      error: error.message
    });
  }
});

// GET /api/offers/search - Search offers
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const offers = await Offer.search(q);

    res.json({
      success: true,
      data: offers,
      message: `Found ${offers.length} offers matching "${q}"`
    });
  } catch (error) {
    console.error('Error searching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search offers',
      error: error.message
    });
  }
});

// GET /api/offers/search/brands - Search brands for suggestions
router.get('/search/brands', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const { Brand } = require('../models/Brand');
    const brands = await Brand.searchBrands(q, parseInt(limit));

    res.json({
      success: true,
      data: brands,
      message: `Found ${brands.length} brands matching "${q}"`
    });
  } catch (error) {
    console.error('Error searching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search brands',
      error: error.message
    });
  }
});

// GET /api/offers/new-lineup - Get offers created within last 5 hours
router.get('/new-lineup', async (req, res) => {
  try {
    const offers = await Offer.getNewLineup();

    res.json({
      success: true,
      data: offers,
      message: `Found ${offers.length} new lineup offers`
    });
  } catch (error) {
    console.error('Error fetching new lineup offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve new lineup offers',
      error: error.message
    });
  }
});

// GET /api/offers/:id - Get specific offer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.getById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    res.json({
      success: true,
      data: offer,
      message: 'Offer retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve offer',
      error: error.message
    });
  }
});

// POST /api/offers - Create new offer (Brand authenticated)
router.post('/', verifyBrandAuth, upload.single('offerImage'), async (req, res) => {
  try {
    const { title, description, discount_percent, category, terms_conditions, usage_limit } = req.body;

    // Validation
    if (!title || !description || !discount_percent) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and discount percentage are required'
      });
    }

    const discountNum = parseFloat(discount_percent);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 0 and 100'
      });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/offers/${req.file.filename}`;
    }

    const offerData = {
      title: title.trim(),
      description: description.trim(),
      discount_percent: discountNum,
      image_url,
      brand_id: req.brandId,
      category: category || 'other',
      terms_conditions: terms_conditions || null,
      usage_limit: usage_limit ? parseInt(usage_limit) : null
    };

    const offer = await Offer.create(offerData);

    res.status(201).json({
      success: true,
      data: offer,
      message: 'Offer created successfully'
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create offer',
      error: error.message
    });
  }
});

// PUT /api/offers/:id - Update offer (Brand authenticated)
router.put('/:id', verifyBrandAuth, upload.single('offerImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, discount_percent, category, status, terms_conditions, usage_limit } = req.body;

    // Check if offer exists and belongs to the brand
    const existingOffer = await Offer.findById(id);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (existingOffer.brand_id !== req.brandId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own offers'
      });
    }

    // Handle image upload
    let image_url = existingOffer.image_url;
    if (req.file) {
      // Delete old image if it exists
      if (existingOffer.image_url) {
        const oldImagePath = path.join(__dirname, '../../', existingOffer.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image_url = `/uploads/offers/${req.file.filename}`;
    }

    const offerData = {
      title: title || existingOffer.title,
      description: description || existingOffer.description,
      discount_percent: discount_percent ? parseFloat(discount_percent) : existingOffer.discount_percent,
      image_url,
      category: category || existingOffer.category,
      status: status || existingOffer.status,
      terms_conditions: terms_conditions !== undefined ? terms_conditions : existingOffer.terms_conditions,
      usage_limit: usage_limit !== undefined ? (usage_limit ? parseInt(usage_limit) : null) : existingOffer.usage_limit
    };

    const updatedOffer = await Offer.update(id, offerData);

    res.json({
      success: true,
      data: updatedOffer,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer',
      error: error.message
    });
  }
});

// DELETE /api/offers/:id - Delete offer (Brand authenticated)
router.delete('/:id', verifyBrandAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if offer exists and belongs to the brand
    const existingOffer = await Offer.findById(id);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (existingOffer.brand_id !== req.brandId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own offers'
      });
    }

    // Delete image file if it exists
    if (existingOffer.image_url) {
      const imagePath = path.join(__dirname, '../../', existingOffer.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Offer.delete(id);

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete offer',
      error: error.message
    });
  }
});

// PATCH /api/offers/:id/status - Update offer status (Brand authenticated)
router.patch('/:id/status', verifyBrandAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, inactive, or expired'
      });
    }

    // Check if offer exists and belongs to the brand
    const existingOffer = await Offer.findById(id);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (existingOffer.brand_id !== req.brandId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own offers'
      });
    }

    const updatedOffer = await Offer.updateStatus(id, status);

    res.json({
      success: true,
      data: updatedOffer,
      message: `Offer status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating offer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer status',
      error: error.message
    });
  }
});

// POST /api/offers/:id/redeem - Increment usage count (public)
router.post('/:id/redeem', async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Offer is not active'
      });
    }

    if (offer.valid_until && new Date(offer.valid_until) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Offer has expired'
      });
    }

    if (offer.usage_limit && offer.used_count >= offer.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Offer usage limit reached'
      });
    }

    const updatedOffer = await Offer.incrementUsage(id);

    res.json({
      success: true,
      data: updatedOffer,
      message: 'Offer redeemed successfully'
    });
  } catch (error) {
    console.error('Error redeeming offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem offer',
      error: error.message
    });
  }
});

// GET /api/offers/stats/overview - Get offer statistics
router.get('/stats/overview', verifyBrandAuth, async (req, res) => {
  try {
    const stats = await Offer.getStats(req.brandId);

    res.json({
      success: true,
      data: stats,
      message: 'Offer statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching offer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve offer statistics',
      error: error.message
    });
  }
});

module.exports = router;
