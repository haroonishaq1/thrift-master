const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'thrift_hub',
  port: process.env.DB_PORT || 5432,
});

async function checkOffers() {
  let client;
  
  try {
    console.log('🔄 Connecting to database...');
    client = await pool.connect();
    
    // Check all offers
    const allOffers = await client.query('SELECT id, title, brand_id, category, status, isapproved FROM offers ORDER BY created_at DESC');
    
    console.log('\n📋 All Offers in Database:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (allOffers.rows.length === 0) {
      console.log('❌ No offers found in database');
    } else {
      allOffers.rows.forEach(offer => {
        console.log(`ID: ${offer.id} | Title: "${offer.title}" | Category: ${offer.category} | Status: ${offer.status} | Approved: ${offer.isapproved}`);
      });
    }
    
    console.log(`\n📊 Total Offers: ${allOffers.rows.length}`);
    
    // Check approved offers
    const approvedOffers = await client.query('SELECT COUNT(*) as count FROM offers WHERE isapproved = true');
    console.log(`✅ Approved Offers: ${approvedOffers.rows[0].count}`);
    
    // Check pending offers
    const pendingOffers = await client.query('SELECT COUNT(*) as count FROM offers WHERE isapproved = false');
    console.log(`⏳ Pending Offers: ${pendingOffers.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking offers:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the check
checkOffers()
  .then(() => {
    console.log('\n✅ Database check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  });
