const { pool } = require('./src/config/database');

const addBrandLogoColumn = async () => {
  try {
    console.log('🔄 Adding logo column to brands table...');
    
    // Check if logo column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'brands' AND column_name = 'logo';
    `;
    
    const columnExists = await pool.query(checkColumnQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ Logo column already exists in brands table');
      return;
    }
    
    // Add logo column
    const addColumnQuery = `
      ALTER TABLE brands 
      ADD COLUMN logo VARCHAR(255);
    `;
    
    await pool.query(addColumnQuery);
    console.log('✅ Logo column added to brands table successfully');
    
  } catch (error) {
    console.error('❌ Error adding logo column:', error.message);
    throw error;
  }
};

// Run the migration
if (require.main === module) {
  addBrandLogoColumn()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { addBrandLogoColumn };
