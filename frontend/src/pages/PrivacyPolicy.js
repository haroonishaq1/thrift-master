import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PolicyPages.css';

function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">
        <div className="policy-content">
          <h1>Privacy Policy</h1>
          <p className="policy-last-updated">Last updated: July 1, 2025</p>
          
          <section className="policy-section">
            <h2>1. Introduction</h2>
            <p>
              At Thrift, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform that connects students with 
              exclusive deals and discounts from trusted brands.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li>Name and contact information (email, phone number)</li>
              <li>Student identification and educational institution details</li>
              <li>Account credentials and preferences</li>
              <li>Usage data and interaction with our platform</li>
            </ul>
            
            <h3>Brand Information</h3>
            <p>For brand partners, we collect:</p>
            <ul>
              <li>Business name, category, and contact details</li>
              <li>Website and domain information</li>
              <li>Business registration and verification documents</li>
              <li>Offer and discount information</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our service</li>
              <li>Verify student status and eligibility for discounts</li>
              <li>Connect students with relevant brand offers</li>
              <li>Process transactions and manage accounts</li>
              <li>Send important updates and promotional communications</li>
              <li>Improve our platform and user experience</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Brand partners (when you engage with their offers)</li>
              <li>Educational institutions (for verification purposes)</li>
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section className="policy-section">
            <h2>5. Student Data Protection</h2>
            <p>
              We take special care to protect student information and comply with educational privacy laws. 
              Student data is used solely for providing discount services and verification purposes.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of promotional communications</li>
              <li>Request information about how your data is used</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide 
              personalized content. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="policy-section">
            <h2>9. Third-Party Services</h2>
            <p>
              Our platform may contain links to third-party websites or services. We are not responsible for 
              the privacy practices of these external sites.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Children's Privacy</h2>
            <p>
              Our service is intended for students who are at least 13 years old. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section className="policy-section">
            <h2>11. International Users</h2>
            <p>
              If you are accessing our service from outside Pakistan, please note that your information may be 
              transferred to and processed in Pakistan where our servers are located.
            </p>
          </section>

          <section className="policy-section">
            <h2>12. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "last updated" date.
            </p>
          </section>

          <section className="policy-section">
            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our 
              <a href="/contact"> contact page</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
