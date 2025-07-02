const { generateToken, formatResponse } = require('../utils/helpers');
const { Brand } = require('../models/Brand');
const { Offer } = require('../models/Offer');
const { 
  sendBrandApprovalEmail, 
  sendBrandRejectionEmail, 
  sendOfferApprovalEmail, 
  sendOfferRejectionEmail 
} = require('../utils/emailService');

// Admin Login with Secret Key
const adminLogin = async (req, res) => {
  try {
    const { secretKey } = req.body;

    if (!secretKey) {
      return res.status(400).json(
        formatResponse(false, 'Secret key is required')
      );
    }

    // Check if secret key matches the one in environment variables
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;
    
    if (!adminSecretKey) {
      console.error('❌ ADMIN_SECRET_KEY not set in environment variables');
      return res.status(500).json(
        formatResponse(false, 'Admin system not configured')
      );
    }

    if (secretKey !== adminSecretKey) {
      console.log('❌ Invalid admin secret key attempt');
      return res.status(401).json(
        formatResponse(false, 'Invalid secret key')
      );
    }

    console.log('✅ Admin login successful');

    // Generate admin token
    const token = generateToken({ 
      role: 'admin',
      type: 'admin',
      adminId: 'admin-' + Date.now()
    });

    return res.json(
      formatResponse(true, 'Admin login successful', {
        admin: {
          role: 'admin',
          loginTime: new Date().toISOString()
        },
        token
      })
    );
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json(
      formatResponse(false, 'Admin login failed')
    );
  }
};

// Get Pending Brand Registrations
const getPendingBrands = async (req, res) => {
  try {
    const pendingBrands = await Brand.getPendingBrands();
    
    return res.json(
      formatResponse(true, 'Pending brands retrieved successfully', {
        pendingBrands,
        totalCount: pendingBrands.length
      })
    );
  } catch (error) {
    console.error('❌ Get pending brands error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to retrieve pending brands')
    );
  }
};

// Get All Brands (approved, pending, rejected)
const getAllBrands = async (req, res) => {
  try {
    const allBrands = await Brand.getAllBrands();

    return res.json(
      formatResponse(true, 'All brands retrieved successfully', {
        brands: allBrands,
        summary: {
          pending: allBrands.filter(b => b.status === 'pending').length,
          approved: allBrands.filter(b => b.status === 'approved').length,
          rejected: allBrands.filter(b => b.status === 'rejected').length,
          total: allBrands.length
        }
      })
    );
  } catch (error) {
    console.error('❌ Get all brands error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to retrieve brands')
    );
  }
};

// Approve Brand Registration
const approveBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { reason } = req.body;

    console.log(`🔍 Approving brand with ID: ${brandId}`);

    // Approve brand in database
    const approvedBrand = await Brand.approve(brandId, 'admin', reason || 'Brand meets all requirements');

    console.log(`✅ Brand approved: ${approvedBrand.name}`);

    // Send approval email
    try {
      await sendBrandApprovalEmail(
        approvedBrand.admin_email,
        approvedBrand.name,
        reason || 'Brand meets all requirements'
      );
      console.log(`📧 Approval email sent to ${approvedBrand.admin_email}`);
    } catch (emailError) {
      console.error('❌ Failed to send approval email:', emailError);
      // Continue without failing the approval process
    }

    return res.json(
      formatResponse(true, 'Brand approved successfully', {
        brand: approvedBrand
      })
    );

  } catch (error) {
    console.error('❌ Approve brand error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json(
        formatResponse(false, 'Brand not found or already processed')
      );
    }
    
    return res.status(500).json(
      formatResponse(false, 'Failed to approve brand')
    );
  }
};

// Reject Brand Registration
const rejectBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { reason } = req.body;

    console.log(`🔍 Rejecting brand with ID: ${brandId}`);

    // Reject brand in database
    const rejectedBrand = await Brand.reject(brandId, 'admin', reason || 'Brand does not meet requirements');

    console.log(`❌ Brand rejected: ${rejectedBrand.name}`);

    // Send rejection email
    try {
      await sendBrandRejectionEmail(
        rejectedBrand.admin_email,
        rejectedBrand.name,
        reason || 'Brand does not meet requirements'
      );
      console.log(`📧 Rejection email sent to ${rejectedBrand.admin_email}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError);
      // Continue without failing the rejection process
    }

    return res.json(
      formatResponse(true, 'Brand rejected successfully', {
        brand: rejectedBrand
      })
    );

  } catch (error) {
    console.error('❌ Reject brand error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json(
        formatResponse(false, 'Brand not found or already processed')
      );
    }
    
    return res.status(500).json(
      formatResponse(false, 'Failed to reject brand')
    );
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const stats = await Brand.getStats();
    const recentRegistrations = await Brand.getPendingBrands();

    const dashboardStats = {
      totalBrands: parseInt(stats.total_brands),
      pendingBrands: parseInt(stats.pending_brands),
      approvedBrands: parseInt(stats.approved_brands),
      rejectedBrands: parseInt(stats.rejected_brands),
      recentRegistrations: recentRegistrations.slice(0, 5), // Last 5 registrations
      lastUpdated: new Date().toISOString()
    };

    return res.json(
      formatResponse(true, 'Dashboard stats retrieved successfully', dashboardStats)
    );
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to retrieve dashboard stats')
    );
  }
};

// Get Pending Offers for Approval
const getPendingOffers = async (req, res) => {
  try {
    console.log('📋 Fetching pending offers for admin approval...');
    
    const pendingOffers = await Offer.getPendingOffers();
    
    console.log(`✅ Found ${pendingOffers.length} pending offers`);
    
    return res.json(
      formatResponse(true, 'Pending offers retrieved successfully', {
        pendingOffers,
        count: pendingOffers.length
      })
    );
  } catch (error) {
    console.error('❌ Get pending offers error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to retrieve pending offers')
    );
  }
};

// Approve Offer
const approveOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const adminId = req.admin?.adminId || 'admin';

    console.log(`🔄 Admin approving offer ID: ${offerId}`);
    
    // Check if offer exists and is pending
    const offer = await Offer.getById(offerId);
    if (!offer) {
      return res.status(404).json(
        formatResponse(false, 'Offer not found')
      );
    }
    
    if (offer.isapproved) {
      return res.status(400).json(
        formatResponse(false, 'Offer is already approved')
      );
    }
    
    // Approve the offer
    const approvedOffer = await Offer.approve(offerId, adminId);
    
    console.log(`✅ Offer "${approvedOffer.title}" approved successfully`);

    // Send approval email to brand
    try {
      // Get brand information
      const brand = await Brand.findById(approvedOffer.brand_id);
      if (brand) {
        await sendOfferApprovalEmail(
          brand.admin_email,
          brand.name,
          approvedOffer.title
        );
        console.log(`📧 Offer approval email sent to ${brand.admin_email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send offer approval email:', emailError);
      // Continue without failing the approval process
    }
    
    return res.json(
      formatResponse(true, 'Offer approved successfully', {
        offer: approvedOffer
      })
    );
  } catch (error) {
    console.error('❌ Approve offer error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to approve offer')
    );
  }
};

// Reject Offer
const rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const adminId = req.admin?.adminId || 'admin';

    console.log(`🔄 Admin rejecting offer ID: ${offerId}`);
    
    // Check if offer exists
    const offer = await Offer.getById(offerId);
    if (!offer) {
      return res.status(404).json(
        formatResponse(false, 'Offer not found')
      );
    }
    
    // Reject the offer
    const rejectedOffer = await Offer.reject(offerId, adminId);
    
    console.log(`✅ Offer "${rejectedOffer.title}" rejected successfully`);

    // Send rejection email to brand
    try {
      // Get brand information
      const brand = await Brand.findById(rejectedOffer.brand_id);
      if (brand) {
        await sendOfferRejectionEmail(
          brand.admin_email,
          brand.name,
          rejectedOffer.title,
          'Offer does not meet approval requirements'
        );
        console.log(`📧 Offer rejection email sent to ${brand.admin_email}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send offer rejection email:', emailError);
      // Continue without failing the rejection process
    }
    
    return res.json(
      formatResponse(true, 'Offer rejected successfully', {
        offer: rejectedOffer
      })
    );
  } catch (error) {
    console.error('❌ Reject offer error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to reject offer')
    );
  }
};

module.exports = {
  adminLogin,
  getPendingBrands,
  getAllBrands,
  approveBrand,
  rejectBrand,
  getDashboardStats,
  getPendingOffers,
  approveOffer,
  rejectOffer
};
