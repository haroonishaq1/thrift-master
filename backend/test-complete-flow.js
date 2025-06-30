const fetch = require('node-fetch');
const FormData = require('form-data');

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Brand Login + Offer Creation Flow...\n');

  try {
    // Step 1: Login as the test brand
    console.log('1️⃣ Logging in as test brand...');
    const loginResponse = await fetch('http://localhost:5000/api/brand-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testbrand@example.com',
        password: 'testpassword123'
      }),
    });

    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('Brand:', loginData.data.brand.name);
    console.log('Token preview:', loginData.data.token.substring(0, 50) + '...\n');

    const token = loginData.data.token;

    // Step 2: Create offer using the real token
    console.log('2️⃣ Creating offer with real token...');
    
    const formData = new FormData();
    formData.append('title', 'Real Token Test Offer');
    formData.append('description', 'This offer was created using a real login token');
    formData.append('discount_percent', '30');
    formData.append('category', 'fashion');

    const offerResponse = await fetch('http://localhost:5000/api/offers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Offer creation status:', offerResponse.status);
    const offerData = await offerResponse.json();
    
    if (offerResponse.ok) {
      console.log('✅ OFFER CREATED SUCCESSFULLY!');
      console.log('Offer ID:', offerData.data.id);
      console.log('Offer Title:', offerData.data.title);
      console.log('Discount:', offerData.data.discount_percent + '%');
      console.log('Brand ID:', offerData.data.brand_id);
    } else {
      console.log('❌ Offer creation failed:', offerData.message);
    }

    // Step 3: Get brand's offers
    console.log('\n3️⃣ Retrieving brand offers...');
    const offersResponse = await fetch('http://localhost:5000/api/offers/brand', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const offersData = await offersResponse.json();
    if (offersResponse.ok) {
      console.log('✅ Retrieved', offersData.data.length, 'offers for brand');
      offersData.data.forEach(offer => {
        console.log(`   - ${offer.title} (${offer.discount_percent}%)`);
      });
    } else {
      console.log('❌ Failed to retrieve offers:', offersData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check server and run test
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('🔗 Server status:', data.message);
    return true;
  } catch (error) {
    console.log('❌ Server not running. Please start the backend server first.');
    return false;
  }
}

async function runTest() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testCompleteFlow();
  }
}

runTest();
