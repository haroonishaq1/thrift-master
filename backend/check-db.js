const { pool } = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking brands table structure...');
    
    // Check table structure
    const tableResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'brands'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Brands table columns:');
    tableResult.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Get sample brand data
    const sampleResult = await pool.query('SELECT * FROM brands WHERE id = 8');
    if (sampleResult.rows.length > 0) {
      const brand = sampleResult.rows[0];
      console.log('\n📋 Brand ID 8 data:');
      console.log('Available fields:', Object.keys(brand));
      console.log('Logo field value:', brand.logo);
      console.log('Phone field value:', brand.phone_number);
      console.log('Website field value:', brand.website);
      console.log('Name:', brand.name);
      console.log('Email:', brand.email);
    } else {
      console.log('\n❌ No brand found with ID 8');
    }
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
