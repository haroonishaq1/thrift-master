const fetch = require('node-fetch');
const FormData = require('form-data');

async function testAPIEndpoint() {
  console.log('🧪 Testing API Endpoint Directly...\n');

  try {
    // Use the token from our previous test
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJ0ZXN0YnJhbmRAZXhhbXBsZS5jb20iLCJ0eXBlIjoiYnJhbmQiLCJpYXQiOjE3MzUxMzczODksImV4cCI6MTczNTc0MjE4OX0.qh8qFOQ0QGZu4kZtBmwOdHOXwWu2rhZTlPMdH8fPRwg';

    // Create form data for the API request
    const formData = new FormData();
    formData.append('title', 'API Test Offer');
    formData.append('description', 'This offer was created via direct API call');
    formData.append('discount_percent', '25');
    formData.append('category', 'electronics');

    console.log('📤 Sending API request...');
    console.log('Token:', token.substring(0, 50) + '...');

    const response = await fetch('http://localhost:5000/api/offers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', response.headers.raw());

    const data = await response.json();
    console.log('📨 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ API ENDPOINT TEST PASSED!');
      console.log('✅ Offer created via API successfully');
    } else {
      console.log('\n❌ API ENDPOINT TEST FAILED');
      console.log('❌ Error:', data.message);
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Test if server is running
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
    await testAPIEndpoint();
  }
}

runTest();
