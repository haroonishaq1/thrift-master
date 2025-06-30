const { Offer } = require('./src/models/Offer.js');

console.log('Testing getById with brand website...');
Offer.getById(1)
  .then(offer => {
    if (offer) {
      console.log('Offer found:');
      console.log('- Title:', offer.title);
      console.log('- Brand Name:', offer.brand_name);
      console.log('- Brand Website:', offer.brand_website);
      console.log('- Redemption URL:', offer.redemptionurl);
    } else {
      console.log('No offer found with ID 1');
    }
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
