const { generateToken, formatResponse } = require('../utils/helpers');
const { Brand } = require('../models/Brand');

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

module.exports = {
  adminLogin,
  getPendingBrands,
  getAllBrands,
  approveBrand,
  rejectBrand,
  getDashboardStats
};
