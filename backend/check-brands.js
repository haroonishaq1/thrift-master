const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'thrift_hub',
  port: process.env.DB_PORT || 5432,
});

async function checkBrands() {
  let client;
  
  try {
    console.log('🔍 Checking brands in database...');
    client = await pool.connect();
    
    // Check all brands with correct column name
    const brands = await client.query('SELECT id, name, email, is_approved FROM brands ORDER BY created_at DESC');
    
    console.log('\n📋 All Brands in Database:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (brands.rows.length === 0) {
      console.log('❌ No brands found in database');
    } else {
      brands.rows.forEach(brand => {
        console.log(`ID: ${brand.id} | Name: "${brand.name}" | Email: ${brand.email} | Approved: ${brand.is_approved}`);
      });
    }
    
    console.log(`\n📊 Total Brands: ${brands.rows.length}`);
    
    // Check approved brands
    const approvedBrands = await client.query('SELECT COUNT(*) as count FROM brands WHERE is_approved = true');
    console.log(`✅ Approved Brands: ${approvedBrands.rows[0].count}`);
    
    // Check pending brands
    const pendingBrands = await client.query('SELECT COUNT(*) as count FROM brands WHERE is_approved = false');
    console.log(`⏳ Pending Brands: ${pendingBrands.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking brands:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

checkBrands()
  .then(() => {
    console.log('\n✅ Brand check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Brand check failed:', error);
    process.exit(1);
  });
