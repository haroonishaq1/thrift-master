const { pool } = require('./src/config/database');

async function addPhoneNumberColumn() {
  try {
    console.log('🔄 Adding phone_number column to brands table...');

    // Add phone_number column to brands table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE brands 
        ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)
      `);
      console.log('✅ Added phone_number column to brands table');
    } catch (error) {
      console.log('ℹ️  phone_number column might already exist:', error.message);
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addPhoneNumberColumn();
