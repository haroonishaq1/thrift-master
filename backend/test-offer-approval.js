const { Offer } = require('./src/models/Offer');

async function testOfferApproval() {
  try {
    console.log('🔄 Testing Offer model and approval system...');
    
    // Test getting all offers
    console.log('📋 Getting all offers...');
    const allOffers = await Offer.getAll();
    console.log(`✅ Found ${allOffers.length} total offers`);
    
    if (allOffers.length > 0) {
      const firstOffer = allOffers[0];
      console.log(`🔍 Testing with offer ID: ${firstOffer.id} - "${firstOffer.title}"`);
      
      // Test getById method
      console.log('📖 Testing getById method...');
      const offerById = await Offer.getById(firstOffer.id);
      if (offerById) {
        console.log(`✅ getById working - Found: "${offerById.title}"`);
        console.log(`📊 Approval status: ${offerById.isapproved ? 'Approved' : 'Pending'}`);
      } else {
        console.log('❌ getById returned null');
      }
      
      // Test getting pending offers
      console.log('📋 Getting pending offers...');
      const pendingOffers = await Offer.getPendingOffers();
      console.log(`✅ Found ${pendingOffers.length} pending offers`);
    } else {
      console.log('ℹ️ No offers found in database');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
if (require.main === module) {
  testOfferApproval()
    .then(() => {
      console.log('✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = testOfferApproval;
