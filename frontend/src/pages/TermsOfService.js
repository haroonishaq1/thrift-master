import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PolicyPages.css';

function TermsOfService() {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">
        <div className="policy-content">
          <h1>Terms of Service</h1>
          <p className="policy-last-updated">Last updated: July 1, 2025</p>
          
          <section className="policy-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Thrift ("our service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. About Thrift</h2>
            <p>
              Thrift is a platform that connects students with exclusive deals and discounts from trusted brands. 
              We facilitate partnerships between educational institutions, students, and businesses to provide 
              verified student discounts and offers.
            </p>
          </section>

          <section className="policy-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of our service, you must register for an account. You are responsible for 
              safeguarding your account information and all activities that occur under your account.
            </p>
            <ul>
              <li>You must provide accurate and complete information during registration</li>
              <li>You must be a verified student to access student discounts</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Brand Partners</h2>
            <p>
              Brands can register on our platform to offer exclusive deals to students. Brand partners must:
            </p>
            <ul>
              <li>Provide accurate business information and valid credentials</li>
              <li>Honor all published offers and discount terms</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain professional conduct in all interactions</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Acceptable Use</h2>
            <p>You agree not to use the service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate any person or entity</li>
              <li>Share false or misleading information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for commercial purposes without authorization</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>6. Student Verification</h2>
            <p>
              Students must provide valid educational credentials to access discounts. We reserve the right to 
              verify student status and may require additional documentation.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property on Thrift are owned by us or our licensors. 
              You may not use our content without explicit permission.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              Thrift shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of the service.
            </p>
          </section>

          <section className="policy-section">
            <h2>9. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violations of these terms 
              or for any other reason we deem appropriate.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes 
              via email or through our platform.
            </p>
          </section>

          <section className="policy-section">
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our 
              <a href="/contact"> contact page</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TermsOfService;
