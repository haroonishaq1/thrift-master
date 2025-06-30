const { pool } = require('./src/config/database');

async function addBrandOtpTypeColumn() {
  try {
    console.log('🔧 Starting brand OTP table migration...');

    // Check if the 'type' column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'brand_otps' AND column_name = 'type'
    `;
    
    const columnCheck = await pool.query(checkColumnQuery);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Type column already exists in brand_otps table');
      return;
    }

    // Add the 'type' column to brand_otps table
    const addColumnQuery = `
      ALTER TABLE brand_otps 
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'registration'
    `;
    
    await pool.query(addColumnQuery);
    console.log('✅ Added type column to brand_otps table');

    // Update existing records to have the 'registration' type
    const updateExistingQuery = `
      UPDATE brand_otps 
      SET type = 'registration' 
      WHERE type IS NULL
    `;
    
    const updateResult = await pool.query(updateExistingQuery);
    console.log(`✅ Updated ${updateResult.rowCount} existing brand OTP records`);

    // Make brand_data nullable since forgot password OTPs don't need brand data
    const alterBrandDataQuery = `
      ALTER TABLE brand_otps 
      ALTER COLUMN brand_data DROP NOT NULL
    `;
    
    await pool.query(alterBrandDataQuery);
    console.log('✅ Made brand_data column nullable');

    console.log('✅ Brand OTP table migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addBrandOtpTypeColumn().catch(console.error);
