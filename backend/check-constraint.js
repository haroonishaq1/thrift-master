const { pool } = require('./src/config/database');

async function checkOfferConstraints() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Check the current constraint definition
    const constraintQuery = `
      SELECT conname, pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint 
      WHERE conrelid = 'offers'::regclass 
      AND contype = 'c'
      AND conname LIKE '%status%';
    `;
    
    const result = await pool.query(constraintQuery);
    console.log('📋 Current status constraints:');
    result.rows.forEach(row => {
      console.log(`Constraint: ${row.conname}`);
      console.log(`Definition: ${row.constraint_def}`);
    });
    
    // Also check the table structure
    const tableQuery = `
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'offers' AND column_name = 'status';
    `;
    
    const tableResult = await pool.query(tableQuery);
    console.log('\n📋 Status column info:');
    console.log(tableResult.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOfferConstraints();
