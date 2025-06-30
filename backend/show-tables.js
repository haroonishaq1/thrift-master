const { pool } = require('./src/config/database.js');

async function showTableStructures() {
  try {
    console.log('=== DATABASE TABLE STRUCTURES ===\n');

    // Show users table
    console.log('USERS TABLE:');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    usersResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    // Show brands table
    console.log('\nBRANDS TABLE:');
    const brandsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'brands' 
      ORDER BY ordinal_position
    `);
    brandsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    // Show brand_otps table
    console.log('\nBRAND_OTPS TABLE:');
    const brandOtpsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'brand_otps' 
      ORDER BY ordinal_position
    `);
    brandOtpsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    // Show user_otps table
    console.log('\nUSER_OTPS TABLE:');
    const userOtpsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_otps' 
      ORDER BY ordinal_position
    `);
    userOtpsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    // Show offers table
    console.log('\nOFFERS TABLE:');
    const offersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'offers' 
      ORDER BY ordinal_position
    `);
    offersResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

showTableStructures();
