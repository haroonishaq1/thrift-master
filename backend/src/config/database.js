const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'thrift_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('📦 Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔧 Creating database tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        university VARCHAR(100) NOT NULL,
        course VARCHAR(100) NOT NULL,
        graduation_year INTEGER NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);    // Create user_otps table
    await pool.query(`      CREATE TABLE IF NOT EXISTS user_otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create brands table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        website VARCHAR(255),
        admin_username VARCHAR(100) NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        description TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        approved_at TIMESTAMP,
        approved_by VARCHAR(100),
        approval_reason TEXT,
        rejected_at TIMESTAMP,
        rejected_by VARCHAR(100),        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create brand OTP table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS brand_otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        brand_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);// Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_otps_expires_at ON user_otps(expires_at)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brands_email ON brands(email)
    `);    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brands_is_approved ON brands(is_approved)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brand_otps_email ON brand_otps(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brand_otps_expires_at ON brand_otps(expires_at)
    `);

    // Create offers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
        image_url VARCHAR(500),
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        category VARCHAR(50) DEFAULT 'other',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        terms_conditions TEXT,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for offers table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_brand_id ON offers(brand_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_valid_dates ON offers(valid_from, valid_until)
    `);

    console.log('✅ Database tables created successfully');

    // Clean up expired OTPs
    await pool.query(`
      DELETE FROM user_otps WHERE expires_at < NOW()
    `);

    console.log('✅ Expired OTPs cleaned up');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
