const { pool } = require('./src/config/database');

const testBrandWithLogo = async () => {
  try {
    console.log('🔍 Testing brand logo storage...');
    
    // First check current brands
    const brands = await pool.query(`
      SELECT id, name, email, logo_url 
      FROM brands 
      ORDER BY created_at DESC
    `);
    
    console.log('\n📋 Current brands with logo status:');
    console.table(brands.rows);
    
    // Check if we have any brands with logos
    const brandsWithLogos = brands.rows.filter(brand => brand.logo_url);
    console.log(`\n✅ Brands with logos: ${brandsWithLogos.length}`);
    console.log(`❌ Brands without logos: ${brands.rows.length - brandsWithLogos.length}`);
    
    if (brandsWithLogos.length > 0) {
      console.log('\n🖼️ Brands with logos:');
      brandsWithLogos.forEach(brand => {
        console.log(`- ${brand.name}: ${brand.logo_url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing brand logos:', error);
  } finally {
    process.exit(0);
  }
};

testBrandWithLogo();
