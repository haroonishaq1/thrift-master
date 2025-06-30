const { pool } = require('../config/database');

// SQL to create brand OTP table
const CREATE_BRAND_OTP_TABLE = `
  CREATE TABLE IF NOT EXISTS brand_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    brand_data JSONB,
    type VARCHAR(50) DEFAULT 'registration',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize brand OTP table
const initializeBrandOTPTable = async () => {
  try {
    await pool.query(CREATE_BRAND_OTP_TABLE);
    console.log('✅ Brand OTP table initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing brand OTP table:', error.message);
    throw error;
  }
};

// Brand OTP model methods
const BrandOTP = {
  // Create a new brand OTP
  create: async (email, otpCode, expiresAt, brandData = null, type = 'registration') => {
    try {
      const query = `
        INSERT INTO brand_otps (email, otp_code, expires_at, brand_data, type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, otp_code, expires_at, type, created_at
      `;
      const values = [email, otpCode, expiresAt, brandData ? JSON.stringify(brandData) : null, type];
      const result = await pool.query(query, values);
      
      console.log(`✅ Brand OTP created for: ${email} (type: ${type})`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating brand OTP:', error.message);
      throw error;
    }
  },

  // Find OTP by email and code with type
  findByEmailAndCode: async (email, otpCode, type = null) => {
    try {
      let query = `
        SELECT * FROM brand_otps 
        WHERE email = $1 AND otp_code = $2 AND is_used = FALSE
      `;
      const values = [email, otpCode];
      
      if (type) {
        query += ` AND type = $3`;
        values.push(type);
      }
      
      query += ` ORDER BY created_at DESC LIMIT 1`;
      
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding brand OTP:', error.message);
      throw error;
    }
  },

  // Mark OTP as used
  markAsUsed: async (id) => {
    try {
      const query = `
        UPDATE brand_otps 
        SET is_used = TRUE 
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error marking brand OTP as used:', error.message);
      throw error;
    }
  },

  // Delete OTPs by email and type
  deleteByEmail: async (email, type = null) => {
    try {
      let query = `DELETE FROM brand_otps WHERE email = $1`;
      const values = [email];
      
      if (type) {
        query += ` AND type = $2`;
        values.push(type);
      }
      
      const result = await pool.query(query, values);
      console.log(`✅ Deleted ${result.rowCount} brand OTPs for: ${email} (type: ${type || 'all'})`);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Error deleting brand OTPs:', error.message);
      throw error;
    }
  },

  // Delete expired OTPs
  deleteExpired: async () => {
    try {
      const query = `
        DELETE FROM brand_otps 
        WHERE expires_at < NOW()
      `;
      const result = await pool.query(query);
      console.log(`✅ Deleted ${result.rowCount} expired brand OTPs`);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Error deleting expired brand OTPs:', error.message);
      throw error;
    }
  },

  // Get latest OTP for email (for resend functionality)
  getLatestByEmail: async (email) => {
    try {
      const query = `
        SELECT * FROM brand_otps 
        WHERE email = $1 AND is_used = FALSE
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting latest brand OTP:', error.message);
      throw error;
    }
  }
};

module.exports = { BrandOTP, initializeBrandOTPTable };
