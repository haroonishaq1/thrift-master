const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// SQL to create brands table
const CREATE_BRANDS_TABLE = `
  CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    logo VARCHAR(255),
    phone_number VARCHAR(20),
    admin_username VARCHAR(100) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'other',
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    approval_reason TEXT,
    rejected_at TIMESTAMP,
    rejected_by VARCHAR(100),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize brands table
const initializeBrandsTable = async () => {
  try {
    await pool.query(CREATE_BRANDS_TABLE);
    console.log('✅ Brands table initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing brands table:', error.message);
    throw error;
  }
};

// Brand model methods
const Brand = {
  // Create a new brand (registration)
  create: async (brandData) => {
    try {
      const {
        name,
        email,
        password,
        website,
        logo,
        phone_number,
        phoneNumber, // Handle both field names
        adminUsername,
        adminEmail,
        description,
        category = 'other'
      } = brandData;

      // Use phoneNumber if phone_number is not provided
      const finalPhoneNumber = phone_number || phoneNumber;
      
      // Standardize website URL
      const standardizedWebsite = website ? Brand.standardizeWebsiteUrl(website) : website;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const query = `
        INSERT INTO brands (name, email, password, website, logo, phone_number, admin_username, admin_email, description, category, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, name, email, website, logo, phone_number, admin_username, admin_email, description, category, is_approved, created_at
      `;

      const values = [name, email, hashedPassword, standardizedWebsite, logo, finalPhoneNumber, adminUsername, adminEmail, description, category, false];
      const result = await pool.query(query, values);

      console.log(`✅ Brand registered: ${name} (Category: ${category}, Website: ${standardizedWebsite}, Pending approval)`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating brand:', error.message);
      throw error;
    }
  },

  // Find brand by email
  findByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM brands WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding brand by email:', error.message);
      throw error;
    }
  },

  // Find brand by ID
  findById: async (id) => {
    try {
      const query = 'SELECT id, name, email, website, logo, phone_number, admin_username, admin_email, description, category, is_approved, created_at, updated_at FROM brands WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding brand by ID:', error.message);
      throw error;
    }
  },

  // Get all pending brands
  getPendingBrands: async () => {
    try {
      const query = `
        SELECT id, name, email, website, logo, admin_username, admin_email, created_at
        FROM brands 
        WHERE is_approved = FALSE AND rejected_at IS NULL
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting pending brands:', error.message);
      throw error;
    }
  },

  // Get all approved brands
  getApprovedBrands: async () => {
    try {
      const query = `
        SELECT id, name, email, website, admin_username, admin_email, description, 
               approved_at, approved_by, approval_reason, created_at
        FROM brands 
        WHERE is_approved = TRUE
        ORDER BY approved_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting approved brands:', error.message);
      throw error;
    }
  },

  // Get all rejected brands
  getRejectedBrands: async () => {
    try {
      const query = `
        SELECT id, name, email, website, admin_username, admin_email, description,
               rejected_at, rejected_by, rejection_reason, created_at
        FROM brands 
        WHERE rejected_at IS NOT NULL
        ORDER BY rejected_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting rejected brands:', error.message);
      throw error;
    }
  },

  // Get all brands with status
  getAllBrands: async () => {
    try {
      const query = `
        SELECT id, name, email, website, logo, admin_username, admin_email, 
               is_approved, approved_at, approved_by, approval_reason,
               rejected_at, rejected_by, rejection_reason, created_at,
               CASE 
                 WHEN rejected_at IS NOT NULL THEN 'rejected'
                 WHEN is_approved = TRUE THEN 'approved'
                 ELSE 'pending'
               END as status
        FROM brands 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting all brands:', error.message);
      throw error;
    }
  },

  // Approve brand
  approve: async (brandId, approvedBy = 'admin', approvalReason = 'Brand meets all requirements') => {
    try {
      const query = `
        UPDATE brands 
        SET is_approved = TRUE, approved_at = CURRENT_TIMESTAMP, 
            approved_by = $2, approval_reason = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND rejected_at IS NULL
        RETURNING id, name, email, is_approved, approved_at, approved_by, approval_reason
      `;
      const result = await pool.query(query, [brandId, approvedBy, approvalReason]);
      
      if (result.rows.length === 0) {
        throw new Error('Brand not found or already rejected');
      }

      console.log(`✅ Brand approved: ${result.rows[0].name}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error approving brand:', error.message);
      throw error;
    }
  },

  // Reject brand
  reject: async (brandId, rejectedBy = 'admin', rejectionReason = 'Brand does not meet requirements') => {
    try {
      const query = `
        UPDATE brands 
        SET rejected_at = CURRENT_TIMESTAMP, rejected_by = $2, rejection_reason = $3, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_approved = FALSE
        RETURNING id, name, email, rejected_at, rejected_by, rejection_reason
      `;
      const result = await pool.query(query, [brandId, rejectedBy, rejectionReason]);
      
      if (result.rows.length === 0) {
        throw new Error('Brand not found or already approved');
      }

      console.log(`❌ Brand rejected: ${result.rows[0].name}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error rejecting brand:', error.message);
      throw error;
    }
  },

  // Check if brand is approved (for login)
  isApproved: async (email) => {
    try {
      const query = 'SELECT is_approved FROM brands WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return false; // Brand not found
      }
      
      return result.rows[0].is_approved;
    } catch (error) {
      console.error('❌ Error checking brand approval status:', error.message);
      throw error;
    }
  },

  // Verify brand login credentials
  verifyCredentials: async (email, password) => {
    try {
      const brand = await Brand.findByEmail(email);
      
      if (!brand) {
        return { valid: false, message: 'Brand not found' };
      }

      if (!brand.is_approved) {
        return { valid: false, message: 'Brand not approved yet. Please wait for admin approval.' };
      }

      if (brand.rejected_at) {
        return { valid: false, message: 'Brand registration was rejected. Please contact support.' };
      }

      const isPasswordValid = await bcrypt.compare(password, brand.password);
      
      if (!isPasswordValid) {
        return { valid: false, message: 'Invalid credentials' };
      }

      return { 
        valid: true, 
        brand: {
          id: brand.id,
          name: brand.name,
          email: brand.email,
          website: brand.website,
          adminUsername: brand.admin_username,
          adminEmail: brand.admin_email
        }
      };
    } catch (error) {
      console.error('❌ Error verifying brand credentials:', error.message);
      throw error;
    }
  },

  // Update brand password
  updatePassword: async (email, hashedPassword) => {
    try {
      const query = `
        UPDATE brands 
        SET password = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE email = $2
        RETURNING id, email
      `;
      const result = await pool.query(query, [hashedPassword, email]);
      
      if (result.rows.length === 0) {
        throw new Error('Brand not found');
      }
      
      console.log(`✅ Password updated for brand: ${email}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating brand password:', error.message);
      throw error;
    }
  },

  // Update brand profile (name, category, phone number only)
  updateProfile: async (brandId, updateData) => {
    try {
      const { name, category, phoneNumber } = updateData;
      
      // Validate required fields
      if (!name || !category) {
        throw new Error('Name and category are required');
      }

      const query = `
        UPDATE brands 
        SET name = $1, category = $2, phone_number = $3, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $4
        RETURNING id, name, email, website, logo, phone_number, admin_username, admin_email, description, category, is_approved, created_at, updated_at
      `;
      
      const result = await pool.query(query, [name, category, phoneNumber || null, brandId]);
      
      if (result.rows.length === 0) {
        throw new Error('Brand not found');
      }
      
      console.log(`✅ Profile updated for brand ID: ${brandId}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating brand profile:', error.message);
      throw error;
    }
  },

  // Update brand info by ID (for brand dashboard)
  updateById: async (id, updateData) => {
    try {
      // Standardize website link if provided
      if (updateData.website) {
        updateData.website = Brand.standardizeWebsiteUrl(updateData.website);
      }

      const query = `
        UPDATE brands 
        SET name = $1, category = $2, phone_number = $3, website = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5 
        RETURNING id, name, email, website, logo, phone_number, admin_username, admin_email, description, category, is_approved, created_at, updated_at
      `;
      const values = [updateData.name, updateData.category, updateData.phone_number, updateData.website, id];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Brand not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating brand by ID:', error.message);
      throw error;
    }
  },

  // Standardize website URL format
  standardizeWebsiteUrl: (url) => {
    if (!url) return url;
    
    // Remove any whitespace
    url = url.trim();
    
    // If it's empty after trimming, return it
    if (!url) return url;
    
    // If it doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    // Convert to lowercase for consistency
    url = url.toLowerCase();
    
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    
    return url;
  },

  // Get brands by category
  getByCategory: async (category) => {
    try {
      const query = `
        SELECT id, name, email, website, description, category, created_at
        FROM brands 
        WHERE is_approved = TRUE AND category = $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting brands by category:', error.message);
      throw error;
    }
  },

  // Get dashboard stats
  getStats: async () => {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_brands,
          COUNT(CASE WHEN is_approved = TRUE THEN 1 END) as approved_brands,
          COUNT(CASE WHEN is_approved = FALSE AND rejected_at IS NULL THEN 1 END) as pending_brands,
          COUNT(CASE WHEN rejected_at IS NOT NULL THEN 1 END) as rejected_brands
        FROM brands
      `;
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting brand stats:', error.message);
      throw error;
    }
  },

  // Search brands for suggestions
  searchBrands: async (searchTerm, limit = 5) => {
    try {
      const query = `
        SELECT id, name, logo
        FROM brands 
        WHERE is_approved = TRUE AND name ILIKE $1
        ORDER BY name ASC
        LIMIT $2
      `;
      const result = await pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error searching brands:', error.message);
      throw error;
    }
  },
};

module.exports = { Brand, initializeBrandsTable };
