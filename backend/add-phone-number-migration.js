const { pool } = require('./src/config/database');

const addPhoneNumberToBrands = async () => {
  try {
    console.log('🚀 Adding phone_number column to brands table...');
    
    // Check if column already exists
    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'brands' AND column_name = 'phone_number';
    `;
    
    const columnExists = await pool.query(columnCheckQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ phone_number column already exists');
      return;
    }
    
    // Add phone_number column
    const addColumnQuery = `
      ALTER TABLE brands 
      ADD COLUMN phone_number VARCHAR(20);
    `;
    
    await pool.query(addColumnQuery);
    console.log('✅ phone_number column added successfully');
    
  } catch (error) {
    console.error('❌ Error adding phone_number column:', error.message);
    throw error;
  }
};

// Run the migration
addPhoneNumberToBrands()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
