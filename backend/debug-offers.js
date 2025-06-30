const { pool } = require('./src/config/database');

const debugOffers = async () => {
  try {
    console.log('🔍 Checking offers in database...');
    
    // Check all offers
    const allOffers = await pool.query(`
      SELECT o.id, o.title, o.category, o.discount_percent, 
             b.name as brand_name, b.category as brand_category
      FROM offers o
      LEFT JOIN brands b ON o.brand_id = b.id
      ORDER BY o.created_at DESC
    `);
    
    console.log('\n📋 All offers:');
    console.table(allOffers.rows);
    
    // Check electronics offers specifically
    const electronicsOffers = await pool.query(`
      SELECT o.id, o.title, o.category, o.discount_percent, 
             b.name as brand_name, b.category as brand_category
      FROM offers o
      LEFT JOIN brands b ON o.brand_id = b.id
      WHERE o.category = 'electronics'
      ORDER BY o.created_at DESC
    `);
    
    console.log('\n⚡ Electronics offers:');
    console.table(electronicsOffers.rows);
    
    // Check brands
    const brands = await pool.query(`
      SELECT id, name, category, is_approved
      FROM brands
      ORDER BY created_at DESC
    `);
    
    console.log('\n🏢 All brands:');
    console.table(brands.rows);
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    process.exit(0);
  }
};

debugOffers();
