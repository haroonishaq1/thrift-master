const { Offer, initializeOffersTable } = require('./src/models/Offer');
const { Brand, initializeBrandsTable } = require('./src/models/Brand');
const { generateToken } = require('./src/utils/helpers');
const { testConnection } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function testOfferCreation() {
  console.log('🧪 Starting Offer Creation Test...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    await testConnection();
    console.log('✅ Database connected successfully\n');

    // 2. Initialize tables
    console.log('2️⃣ Initializing database tables...');
    await initializeBrandsTable();
    await initializeOffersTable();
    console.log('✅ Tables initialized successfully\n');

    // 3. Create a test brand (if it doesn't exist)
    console.log('3️⃣ Creating test brand...');
    const testBrandData = {
      name: 'Test Brand',
      email: 'testbrand@example.com',
      password: 'testpassword123',
      website: 'https://testbrand.com',
      adminUsername: 'testadmin',
      adminEmail: 'admin@testbrand.com',
      description: 'This is a test brand for offer testing'
    };

    let testBrand;
    try {
      // Check if brand already exists
      const existingBrand = await Brand.findByEmail(testBrandData.email);
      if (existingBrand) {
        console.log('📝 Using existing test brand:', existingBrand.name);
        testBrand = existingBrand;
      } else {
        testBrand = await Brand.create(testBrandData);
        console.log('✅ Test brand created:', testBrand.name);
        
        // Approve the brand
        await Brand.approve(testBrand.id, 'test-system', 'Auto-approved for testing');
        console.log('✅ Test brand approved');
      }
    } catch (error) {
      console.log('📝 Brand might already exist, trying to find it...');
      testBrand = await Brand.findByEmail(testBrandData.email);
      if (!testBrand) {
        throw error;
      }
    }

    console.log('Brand ID:', testBrand.id);
    console.log('Brand Email:', testBrand.email, '\n');

    // 4. Generate a test JWT token
    console.log('4️⃣ Generating JWT token...');
    const token = generateToken({
      id: testBrand.id,
      email: testBrand.email,
      type: 'brand'
    });
    console.log('✅ Token generated:', token.substring(0, 50) + '...\n');

    // 5. Test offer creation
    console.log('5️⃣ Creating test offer...');
    const testOfferData = {
      title: 'Test Offer - 20% Off',
      description: 'This is a test offer created by the backend test script',
      discount_percent: 20.00,
      image_url: '/uploads/offers/test-offer.jpg',
      brand_id: testBrand.id,
      category: 'electronics',
      terms_conditions: 'Valid for new customers only',
      usage_limit: 100
    };

    const createdOffer = await Offer.create(testOfferData);
    console.log('✅ Offer created successfully!');
    console.log('Offer ID:', createdOffer.id);
    console.log('Offer Title:', createdOffer.title);
    console.log('Discount:', createdOffer.discount_percent + '%');
    console.log('Brand ID:', createdOffer.brand_id, '\n');

    // 6. Test retrieving the offer
    console.log('6️⃣ Retrieving created offer...');
    const retrievedOffer = await Offer.findById(createdOffer.id);
    console.log('✅ Offer retrieved successfully!');
    console.log('Retrieved offer:', {
      id: retrievedOffer.id,
      title: retrievedOffer.title,
      brand_name: retrievedOffer.brand_name,
      discount_percent: retrievedOffer.discount_percent
    }, '\n');

    // 7. Test getting all offers for the brand
    console.log('7️⃣ Getting all offers for brand...');
    const brandOffers = await Offer.getByBrandId(testBrand.id);
    console.log('✅ Found', brandOffers.length, 'offers for brand');
    brandOffers.forEach(offer => {
      console.log(`   - ${offer.title} (${offer.discount_percent}%)`);
    });
    console.log('');

    // 8. Test public offers retrieval
    console.log('8️⃣ Testing public offers retrieval...');
    const publicOffers = await Offer.getAll({ publicView: true, limit: 5 });
    console.log('✅ Found', publicOffers.length, 'public offers');
    publicOffers.forEach(offer => {
      console.log(`   - ${offer.title} by ${offer.brand_name} (${offer.discount_percent}%)`);
    });
    console.log('');

    // 9. Test offer statistics
    console.log('9️⃣ Getting offer statistics...');
    const stats = await Offer.getStats(testBrand.id);
    console.log('✅ Offer statistics for brand:');
    console.log('   Total offers:', stats.total_offers);
    console.log('   Active offers:', stats.active_offers);
    console.log('   Average discount:', parseFloat(stats.avg_discount).toFixed(2) + '%');
    console.log('   Total usage:', stats.total_usage, '\n');

    console.log('🎉 ALL TESTS PASSED! Offer creation is working correctly!\n');
    
    console.log('📋 Test Summary:');
    console.log('✅ Database connection: Working');
    console.log('✅ Table creation: Working');
    console.log('✅ Brand creation: Working');
    console.log('✅ JWT token generation: Working');
    console.log('✅ Offer creation: Working');
    console.log('✅ Offer retrieval: Working');
    console.log('✅ Brand offers query: Working');
    console.log('✅ Public offers query: Working');
    console.log('✅ Statistics: Working');
    
    console.log('\n🔗 You can now test the API endpoints:');
    console.log('POST http://localhost:5000/api/offers');
    console.log('GET  http://localhost:5000/api/offers');
    console.log('GET  http://localhost:5000/api/offers/brand');
    console.log(`Authorization: Bearer ${token.substring(0, 30)}...`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    console.log('\n🏁 Test completed.');
    process.exit(0);
  }
}

// Run the test
testOfferCreation();
