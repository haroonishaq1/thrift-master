const { pool } = require('../config/database');

// SQL to create users table
const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    university VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    graduation_year INTEGER NOT NULL,
    student_id VARCHAR(100),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT TRUE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// SQL to create OTP table
const CREATE_OTP_TABLE = `
  CREATE TABLE IF NOT EXISTS user_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    type VARCHAR(20) DEFAULT 'registration',
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize database tables
const initializeTables = async () => {
  try {
    await pool.query(CREATE_USERS_TABLE);
    await pool.query(CREATE_OTP_TABLE);
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error.message);
    throw error;
  }
};

// User model methods
const User = {
  // Create a new user
  create: async (userData) => {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      age,
      gender,
      country,
      city,
      university,
      course,
      student_id,
      phone
    } = userData;

    const query = `
      INSERT INTO users (
        first_name, last_name, username, email, password, age, gender, 
        country, city, university, course, student_id, phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, first_name, last_name, username, email, age, gender, 
                country, city, university, course, student_id, phone, profile_picture, email_verified, created_at
    `;

    const values = [
      first_name,
      last_name,
      username,
      email,
      password,
      age,
      gender,
      country,
      city,
      university,
      course,
      student_id,
      phone
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },  // Find user by ID
  findById: async (id) => {
    const query = `
      SELECT id, first_name, last_name, username, email, age, gender, 
             country, city, university, course, phone, email_verified, created_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Find user by username
  findByUsername: async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  },

  // Update email verification status
  updateEmailVerification: async (email, verified = true) => {
    const query = 'UPDATE users SET email_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING *';
    const result = await pool.query(query, [verified, email]);
    return result.rows[0];
  },

  // Update user password
  updatePassword: async (email, hashedPassword) => {
    const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email';
    const result = await pool.query(query, [hashedPassword, email]);
    return result.rows[0];
  },

  // Update user profile
  update: async (id, userData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update user by ID
  updateById: async (id, userData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null) {
        fields.push(`${key} = $${paramCount}`);
        values.push(userData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

// OTP model methods
const OTP = {
  // Create OTP
  create: async (otpData) => {
    const { email, otp_code, expires_at, type = 'registration' } = otpData;
    const query = `
      INSERT INTO user_otps (email, otp_code, expires_at, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, otp_code, expires_at, type, created_at
    `;
    const result = await pool.query(query, [email, otp_code, expires_at, type]);
    return result.rows[0];
  },

  // Find valid OTP
  findValid: async (email, otpCode, type = 'registration') => {
    const query = `
      SELECT * FROM user_otps 
      WHERE email = $1 AND otp_code = $2 AND type = $3 AND expires_at > NOW() AND is_used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [email, otpCode, type]);
    return result.rows[0];
  },

  // Find OTP by email and code with type
  findByEmailAndCode: async (email, otpCode, type = 'registration') => {
    const query = `
      SELECT * FROM user_otps 
      WHERE email = $1 AND otp_code = $2 AND type = $3 AND is_used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [email, otpCode, type]);
    return result.rows[0];
  },

  // Delete OTPs by email and type
  deleteByEmail: async (email, type = 'registration') => {
    const query = 'DELETE FROM user_otps WHERE email = $1 AND type = $2';
    const result = await pool.query(query, [email, type]);
    return result.rowCount;
  },

  // Mark OTP as used
  markAsUsed: async (id) => {
    const query = 'UPDATE user_otps SET is_used = TRUE WHERE id = $1';
    await pool.query(query, [id]);
  },

  // Clean expired OTPs
  cleanExpired: async () => {
    const query = 'DELETE FROM user_otps WHERE expires_at < NOW()';
    const result = await pool.query(query);
    return result.rowCount;
  }
};

module.exports = {
  User,
  OTP,
  initializeTables
};
