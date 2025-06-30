const { pool } = require('./src/config/database');

// Add category column to brands table
const addBrandCategoryColumn = async () => {
  try {
    console.log('🔧 Adding category column to brands table...');
    
    // Add category column
    await pool.query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other'
    `);
    
    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(category)
    `);
    
    console.log('✅ Category column added to brands table successfully');
    
    // Update existing brands with sample categories (for testing)
    await pool.query(`
      UPDATE brands 
      SET category = CASE 
        WHEN LOWER(name) LIKE '%sony%' OR LOWER(name) LIKE '%samsung%' OR LOWER(name) LIKE '%apple%' THEN 'electronics'
        WHEN LOWER(name) LIKE '%nike%' OR LOWER(name) LIKE '%adidas%' THEN 'fashion'
        WHEN LOWER(name) LIKE '%test%' THEN 'electronics'
        ELSE 'other'
      END
      WHERE category = 'other'
    `);
    
    console.log('✅ Existing brands updated with sample categories');
    
  } catch (error) {
    console.error('❌ Error adding category column:', error.message);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await addBrandCategoryColumn();
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

main();
