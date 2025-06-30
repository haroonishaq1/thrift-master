const { Offer } = require('./src/models/Offer.js');

console.log('Testing if brand website is included in offer data...');

// Test with existing offers
Offer.getAll({}, 1)
  .then(offers => {
    if (offers.length > 0) {
      const offer = offers[0];
      console.log('Found offer:');
      console.log('- ID:', offer.id);
      console.log('- Title:', offer.title);
      console.log('- Brand Name:', offer.brand_name);
      console.log('- Brand Website:', offer.brand_website);
      console.log('- Redemption URL:', offer.redemptionurl);
    } else {
      console.log('No offers found');
    }
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
