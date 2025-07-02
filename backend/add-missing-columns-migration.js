const { pool } = require('./src/config/database');

// Migration to add missing columns to users and brands tables
const addMissingColumns = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Add profile_picture column to users table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)
      `);
      console.log('✅ Added profile_picture column to users table');
    } catch (error) {
      console.log('⚠️ Profile picture column may already exist:', error.message);
    }

    // Add phone_number column to brands table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE brands 
        ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)
      `);
      console.log('✅ Added phone_number column to brands table');
    } catch (error) {
      console.log('⚠️ Phone number column may already exist:', error.message);
    }

    // Standardize existing website URLs in brands table
    try {
      const brandsWithWebsites = await pool.query(`
        SELECT id, website FROM brands 
        WHERE website IS NOT NULL AND website != ''
      `);

      for (const brand of brandsWithWebsites.rows) {
        let standardizedUrl = brand.website.trim();
        
        if (standardizedUrl && !standardizedUrl.match(/^https?:\/\//i)) {
          standardizedUrl = 'https://' + standardizedUrl;
        }
        
        standardizedUrl = standardizedUrl.toLowerCase().replace(/\/$/, '');
        
        if (standardizedUrl !== brand.website) {
          await pool.query(`
            UPDATE brands SET website = $1 WHERE id = $2
          `, [standardizedUrl, brand.id]);
          console.log(`✅ Standardized website URL for brand ${brand.id}: ${brand.website} -> ${standardizedUrl}`);
        }
      }
      
      console.log('✅ Website URL standardization completed');
    } catch (error) {
      console.error('❌ Error standardizing website URLs:', error.message);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  addMissingColumns()
    .then(() => {
      console.log('Migration completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addMissingColumns };
