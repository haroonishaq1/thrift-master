const { Offer } = require('./src/models/Offer.js');

console.log('Testing offer API endpoint...');

// Test with an existing offer ID
Offer.getById(3)  // Using ID 3 which we saw before
  .then(offer => {
    if (offer) {
      console.log('\n✅ Offer found:');
      console.log('- ID:', offer.id);
      console.log('- Title:', offer.title);
      console.log('- Brand Name:', offer.brand_name);
      console.log('- Brand Website:', offer.brand_website);
      console.log('- Full offer object keys:', Object.keys(offer));
    } else {
      console.log('❌ No offer found');
    }
  })
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => process.exit(0));
