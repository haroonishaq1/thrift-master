const { pool } = require('./src/config/database');

const debugBrandLogos = async () => {
  try {
    console.log('🔍 Checking brand logos in database...');
    
    // Get all brands with their logo status
    const result = await pool.query(`
      SELECT id, name, email, logo, is_approved 
      FROM brands 
      ORDER BY created_at DESC
    `);
    
    console.log(`\n📊 Found ${result.rows.length} brands in database:`);
    console.table(result.rows);
    
    // Check specifically for approved brands with logos
    const approvedWithLogos = result.rows.filter(brand => brand.is_approved && brand.logo);
    console.log(`\n✅ Approved brands with logos: ${approvedWithLogos.length}`);
    
    if (approvedWithLogos.length > 0) {
      console.log('\n🖼️ Approved brands with logo paths:');
      approvedWithLogos.forEach(brand => {
        console.log(`- ${brand.name}: ${brand.logo}`);
      });
    }
    
    // Check for approved brands without logos
    const approvedWithoutLogos = result.rows.filter(brand => brand.is_approved && !brand.logo);
    console.log(`\n❌ Approved brands without logos: ${approvedWithoutLogos.length}`);
    
    if (approvedWithoutLogos.length > 0) {
      console.log('\n📝 Approved brands missing logos:');
      approvedWithoutLogos.forEach(brand => {
        console.log(`- ${brand.name} (ID: ${brand.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

debugBrandLogos();
