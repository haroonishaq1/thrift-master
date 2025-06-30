const { pool } = require('../config/database');

// SQL to create offers table
const CREATE_OFFERS_TABLE = `
  CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    image_url VARCHAR(500),
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'other',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    isApproved BOOLEAN DEFAULT FALSE,
    approvedAt DATETIME NULL,
    approvedBy INT NULL,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    terms_conditions TEXT,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Create indexes for better performance
const CREATE_OFFERS_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_offers_brand_id ON offers(brand_id);
  CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category);
  CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
  CREATE INDEX IF NOT EXISTS idx_offers_approval ON offers(isApproved);
  CREATE INDEX IF NOT EXISTS idx_offers_valid_dates ON offers(valid_from, valid_until);
`;

// Initialize offers table
const initializeOffersTable = async () => {
  try {
    await pool.query(CREATE_OFFERS_TABLE);
    await pool.query(CREATE_OFFERS_INDEXES);
    console.log('✅ Offers table initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing offers table:', error.message);
    throw error;
  }
};

// Offer model methods
const Offer = {
  // Create a new offer
  create: async (offerData) => {
    try {
      const {
        title,
        description,
        discount_percent,
        image_url,
        brand_id,
        category = 'other',
        valid_until,
        terms_conditions,
        usage_limit
      } = offerData;

      const query = `
        INSERT INTO offers (title, description, discount_percent, image_url, brand_id, category, valid_until, terms_conditions, usage_limit)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, description, discount_percent, image_url, brand_id, category, status, valid_from, valid_until, created_at
      `;

      const values = [title, description, discount_percent, image_url, brand_id, category, valid_until, terms_conditions, usage_limit];
      const result = await pool.query(query, values);

      console.log(`✅ Offer created: ${title} for brand ID ${brand_id}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating offer:', error.message);
      throw error;
    }
  },

  // Find offer by ID
  findById: async (id) => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.email as brand_email, b.logo as brand_logo
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE o.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding offer by ID:', error.message);
      throw error;
    }
  },

  // Get all offers with optional filters
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT o.*, b.name as brand_name, b.email as brand_email, b.logo as brand_logo, b.website as brand_website
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE 1=1
      `;
      const values = [];
      let paramCount = 0;

      // Filter by brand
      if (filters.brand_id) {
        paramCount++;
        query += ` AND o.brand_id = $${paramCount}`;
        values.push(filters.brand_id);
      }

      // Filter by category
      if (filters.category) {
        paramCount++;
        query += ` AND o.category = $${paramCount}`;
        values.push(filters.category);
      }

      // Filter by status
      if (filters.status) {
        paramCount++;
        query += ` AND o.status = $${paramCount}`;
        values.push(filters.status);
      }

      // Only active, approved and non-expired offers for public view
      if (filters.publicView) {
        query += ` AND o.status = 'active' AND o.isApproved = true AND (o.valid_until IS NULL OR o.valid_until > CURRENT_TIMESTAMP)`;
      }

      query += ` ORDER BY o.created_at DESC`;

      // Add limit if specified
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
      }

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting offers:', error.message);
      throw error;
    }
  },

  // Get offer by ID
  getById: async (id) => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.email as brand_email, b.logo as brand_logo, b.website as brand_website
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE o.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting offer by ID:', error.message);
      throw error;
    }
  },

  // Get offers by brand ID
  getByBrandId: async (brandId) => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.logo as brand_logo, b.website as brand_website
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE o.brand_id = $1
        ORDER BY o.created_at DESC
      `;
      const result = await pool.query(query, [brandId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting offers by brand ID:', error.message);
      throw error;
    }
  },

  // Update offer
  update: async (id, offerData) => {
    try {
      const {
        title,
        description,
        discount_percent,
        image_url,
        category,
        status,
        valid_until,
        terms_conditions,
        usage_limit
      } = offerData;

      const query = `
        UPDATE offers 
        SET title = $1, description = $2, discount_percent = $3, image_url = $4, 
            category = $5, status = $6, valid_until = $7, terms_conditions = $8, 
            usage_limit = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;

      const values = [title, description, discount_percent, image_url, category, status, valid_until, terms_conditions, usage_limit, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Offer not found');
      }

      console.log(`✅ Offer updated: ${title}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating offer:', error.message);
      throw error;
    }
  },

  // Delete offer
  delete: async (id) => {
    try {
      const query = 'DELETE FROM offers WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Offer not found');
      }

      console.log(`✅ Offer deleted: ${result.rows[0].title}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting offer:', error.message);
      throw error;
    }
  },

  // Update offer status
  updateStatus: async (id, status) => {
    try {
      const query = `
        UPDATE offers 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [status, id]);

      if (result.rows.length === 0) {
        throw new Error('Offer not found');
      }

      console.log(`✅ Offer status updated: ${result.rows[0].title} -> ${status}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating offer status:', error.message);
      throw error;
    }
  },

  // Search offers
  search: async (searchTerm) => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.logo as brand_logo
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE (o.title ILIKE $1 OR o.description ILIKE $1 OR b.name ILIKE $1)
        AND o.status = 'active' 
        AND (o.valid_until IS NULL OR o.valid_until > CURRENT_TIMESTAMP)
        ORDER BY o.created_at DESC
      `;
      const result = await pool.query(query, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error searching offers:', error.message);
      throw error;
    }
  },

  // Get featured offers (highest discount or most recent)
  getFeatured: async (limit = 4) => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.logo as brand_logo
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE o.status = 'active' 
        AND (o.valid_until IS NULL OR o.valid_until > CURRENT_TIMESTAMP)
        ORDER BY o.discount_percent DESC, o.created_at DESC
        LIMIT $1
      `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting featured offers:', error.message);
      throw error;
    }
  },

  // Get offers by category
  getByCategory: async (category) => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.logo as brand_logo, b.website as brand_website
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE o.category = $1 
        AND o.status = 'active' 
        AND o.isApproved = true
        AND (o.valid_until IS NULL OR o.valid_until > CURRENT_TIMESTAMP)
        ORDER BY o.created_at DESC
      `;
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting offers by category:', error.message);
      throw error;
    }
  },

  // Increment usage count
  incrementUsage: async (id) => {
    try {
      const query = `
        UPDATE offers 
        SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error incrementing offer usage:', error.message);
      throw error;
    }
  },

  // Get offer statistics
  getStats: async (brandId = null) => {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_offers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_offers,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_offers,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_offers,
          COUNT(CASE WHEN isApproved = true THEN 1 END) as approved_offers,
          COUNT(CASE WHEN isApproved = false THEN 1 END) as pending_offers,
          AVG(discount_percent) as avg_discount,
          SUM(used_count) as total_usage
        FROM offers
      `;
      const values = [];

      if (brandId) {
        query += ` WHERE brand_id = $1`;
        values.push(brandId);
      }

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting offer stats:', error.message);
      throw error;
    }
  },

  // Get pending offers for admin approval
  getPendingOffers: async () => {
    try {
      const query = `
        SELECT o.*, b.name as brand_name, b.email as brand_email, b.logo as brand_logo
        FROM offers o
        LEFT JOIN brands b ON o.brand_id = b.id
        WHERE o.isApproved = false
        ORDER BY o.created_at ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting pending offers:', error.message);
      throw error;
    }
  },

  // Approve offer
  approve: async (offerId, adminId) => {
    try {
      const query = `
        UPDATE offers 
        SET isApproved = true, approvedAt = CURRENT_TIMESTAMP, approvedBy = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [offerId, adminId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error approving offer:', error.message);
      throw error;
    }
  },

  // Reject offer
  reject: async (offerId, adminId) => {
    try {
      const query = `
        UPDATE offers 
        SET status = 'inactive', isApproved = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [offerId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error rejecting offer:', error.message);
      throw error;
    }
  }
};

module.exports = { Offer, initializeOffersTable };
