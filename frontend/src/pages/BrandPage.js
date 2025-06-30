import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getBrandData } from '../services/brandData';
import '../styles/BrandPage.css';

function BrandPage() {
  const { brandName } = useParams();
  const navigate = useNavigate();
  const [brandData, setBrandData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const data = getBrandData(brandName);
      setBrandData(data);
    } catch (err) {
      setError(err.message);
      // Optionally redirect to home page after a delay
      setTimeout(() => navigate('/'), 3000);
    }
  }, [brandName, navigate]);
  if (error) {
    return (
      <div className="brand-page">
        <Header />
        <div className="error-message">
          {error}. Redirecting to home page...
        </div>
        <Footer />
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="brand-page">
        <Header />
        <div className="loading">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="brand-page">
      <Header />
      <main className="brand-content">
        <div className="brand-header">
          <div className="brand-logo-container">
            <img 
              src={brandData.logo}
              alt={brandData.name}
              className="brand-logo"
            />
            <h1 className="brand-name">{brandData.name}</h1>
          </div>
        </div>

        <section className="benefits-section">
          <h2 className="section-title">Benefits for students</h2>          <div className="benefit-card">
            <div className="benefit-image">
              <img 
                src={brandData.promoImage}
                alt={`${brandData.name} promotion`}
              />
            </div>
            <div className="benefit-content">
              <h3 className="discount-text">{brandData.discount}</h3>
              <p className="benefit-type">{brandData.type}</p>
              <button className="redeem-button">
                Redeem now
              </button>
            </div>
          </div>
        </section>

        <section className="terms-section">
          <h2 className="section-title">Terms & Conditions</h2>
          <div className="terms-content">
            <ul>
              {brandData.terms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default BrandPage;
