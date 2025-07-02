const { pool } = require('./src/config/database');
const { Brand } = require('./src/models/Brand');
const { sendForgotPasswordOTPEmail } = require('./src/utils/emailService');

async function testBrandForgotPassword() {
  try {
    console.log('🔍 Testing brand forgot password functionality...');
    
    const email = 'haroonishaq975@gmail.com';
    console.log(`📧 Testing with email: ${email}`);
    
    // Check if brand exists
    const existingBrand = await Brand.findByEmail(email);
    console.log('🏢 Brand found:', existingBrand ? existingBrand.name : 'Not found');
    
    if (existingBrand) {
      console.log('✅ Brand exists, would send email to:', existingBrand.name);
      console.log('📧 Email would be sent using sendForgotPasswordOTPEmail function');
    } else {
      console.log('❌ Brand not found for email:', email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBrandForgotPassword();
