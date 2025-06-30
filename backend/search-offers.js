const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'thrift_hub',
  port: process.env.DB_PORT || 5432,
});

async function searchSpecificOffers() {
  let client;
  
  try {
    console.log('🔍 Searching for specific offers...');
    client = await pool.connect();
    
    const searchTerms = ['Soloman', 'HP', 'Gymshark', 'Apple'];
    
    for (const term of searchTerms) {
      const result = await client.query(
        'SELECT id, title, category, status, isapproved FROM offers WHERE title ILIKE $1',
        [`%${term}%`]
      );
      
      console.log(`\n🔍 Search for "${term}":`);
      if (result.rows.length === 0) {
        console.log(`❌ No offers found containing "${term}"`);
      } else {
        result.rows.forEach(offer => {
          console.log(`✅ Found: ID ${offer.id} - "${offer.title}" (${offer.category}) - Status: ${offer.status} - Approved: ${offer.isapproved}`);
        });
      }
    }
    
    // Also get brands to see where this data might be coming from
    console.log('\n📋 All Brands:');
    const brands = await client.query('SELECT id, name, email, isapproved FROM brands ORDER BY created_at DESC');
    brands.rows.forEach(brand => {
      console.log(`Brand: ${brand.name} (${brand.email}) - Approved: ${brand.isapproved}`);
    });
    
  } catch (error) {
    console.error('❌ Error searching offers:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

searchSpecificOffers()
  .then(() => {
    console.log('\n✅ Search completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Search failed:', error);
    process.exit(1);
  });
