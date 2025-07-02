const { pool } = require('./src/config/database');

async function addRejectedStatusToConstraint() {
  try {
    console.log('🔄 Connecting to database...');
    
    // First, drop the existing constraint
    console.log('🗑️ Dropping existing status constraint...');
    await pool.query('ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;');
    
    // Then, add the new constraint with 'rejected' included
    console.log('✅ Adding new status constraint with rejected status...');
    await pool.query(`
      ALTER TABLE offers 
      ADD CONSTRAINT offers_status_check 
      CHECK (status IN ('active', 'inactive', 'expired', 'rejected'));
    `);
    
    console.log('✅ Database constraint updated successfully!');
    console.log('📋 Now the status column accepts: active, inactive, expired, rejected');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating constraint:', error.message);
    process.exit(1);
  }
}

addRejectedStatusToConstraint();
