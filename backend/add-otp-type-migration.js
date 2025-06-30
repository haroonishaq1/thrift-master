const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'thrift_db',
  password: process.env.DB_PASSWORD || 'adminshifa123', 
  port: process.env.DB_PORT || 5432,
});

const addOtpTypeColumn = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding type column to user_otps table...');
    
    // Check if type column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_otps' 
      AND column_name = 'type';
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('➕ Adding type column to user_otps table...');
      await client.query(`
        ALTER TABLE user_otps 
        ADD COLUMN type VARCHAR(20) DEFAULT 'registration';
      `);
      console.log('✅ Added type column successfully');
    } else {
      console.log('⏭️  Type column already exists');
    }
    
    // Show current user_otps table structure
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_otps'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Current user_otps table structure:');
    console.table(tableStructure.rows);
    
    console.log('✅ OTP type column migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the migration
addOtpTypeColumn().catch(console.error);
