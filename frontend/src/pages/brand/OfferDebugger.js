import React, { useEffect, useState } from 'react';

const OfferDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const brandToken = localStorage.getItem('brand-token');
    const brandData = localStorage.getItem('brand-data');
    
    setDebugInfo({
      brandToken,
      brandTokenType: typeof brandToken,
      brandTokenLength: brandToken ? brandToken.length : 0,
      brandData,
      localStorage: Object.keys(localStorage).map(key => ({
        key,
        value: localStorage.getItem(key)
      }))
    });
  }, []);

  const testCreateOffer = async () => {
    try {
      const brandToken = localStorage.getItem('brand-token');
      console.log('🔍 Sending request with token:', brandToken);

      const formData = new FormData();
      formData.append('title', 'Test Offer');
      formData.append('description', 'This is a test offer');
      formData.append('discount_percent', '20');
      formData.append('category', 'other');

      const response = await fetch('http://localhost:5000/api/offers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${brandToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Response:', data);
      alert(`Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Offer Creation Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Local Storage Debug Info:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <button 
        onClick={testCreateOffer}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4361ee',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Create Offer
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Manual Token Test:</h3>
        <p>Brand Token: <code>{debugInfo.brandToken || 'NOT FOUND'}</code></p>
        <p>Token Type: <code>{debugInfo.brandTokenType}</code></p>
        <p>Token Length: <code>{debugInfo.brandTokenLength}</code></p>
      </div>
    </div>
  );
};

export default OfferDebugger;
