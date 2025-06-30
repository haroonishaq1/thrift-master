const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addTypeColumnToOTPs() {
  try {
    console.log('🔧 Adding type column to otps table...');
    
    // Check if type column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_otps' AND column_name = 'type'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Type column already exists in user_otps table');
      return;
    }
    
    // Add type column with default value 'registration'
    await pool.query(`
      ALTER TABLE user_otps 
      ADD COLUMN type VARCHAR(50) DEFAULT 'registration'
    `);
    
    console.log('✅ Type column added successfully to user_otps table');
    
    // Update existing records to have 'registration' type
    await pool.query(`
      UPDATE user_otps 
      SET type = 'registration' 
      WHERE type IS NULL
    `);
    
    console.log('✅ Existing OTP records updated with registration type');
    
  } catch (error) {
    console.error('❌ Error adding type column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addTypeColumnToOTPs()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
