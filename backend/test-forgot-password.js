const { pool } = require('./src/config/database');
const { User } = require('./src/models/User');
const { Brand } = require('./src/models/Brand');

async function testForgotPassword() {
  try {
    console.log('🔍 Testing forgot password functionality...');
    
    // Test email you're trying to use
    const testEmail = 'haroonishaq975@gmail.com';
    
    console.log(`\n📧 Checking email: ${testEmail}`);
    
    // Check if user exists
    console.log('\n👤 Checking users table...');
    const user = await User.findByEmail(testEmail);
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        verified: user.email_verified
      });
    } else {
      console.log('❌ User not found in users table');
    }
    
    // Check if brand exists
    console.log('\n🏢 Checking brands table...');
    const brand = await Brand.findByEmail(testEmail);
    if (brand) {
      console.log('✅ Brand found:', {
        id: brand.id,
        name: brand.name,
        email: brand.email,
        approved: brand.is_approved
      });
    } else {
      console.log('❌ Brand not found in brands table');
    }
    
    // Show all users and brands in database
    console.log('\n👥 All users in database:');
    const allUsers = await pool.query('SELECT id, first_name, last_name, email FROM users LIMIT 10');
    if (allUsers.rows.length > 0) {
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
      });
    } else {
      console.log('  No users found');
    }
    
    console.log('\n🏢 All brands in database:');
    const allBrands = await pool.query('SELECT id, name, email FROM brands LIMIT 10');
    if (allBrands.rows.length > 0) {
      allBrands.rows.forEach(brand => {
        console.log(`  - ${brand.name} (${brand.email})`);
      });
    } else {
      console.log('  No brands found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testForgotPassword();
