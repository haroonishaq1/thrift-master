import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/PolicyPages.css';

function CookiePolicy() {
  return (
    <div className="policy-page">
      <Header />
      <div className="policy-container">
        <div className="policy-content">
          <h1>Cookie Policy</h1>
          <p className="policy-last-updated">Last updated: July 1, 2025</p>
          
          <section className="policy-section">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences and understanding how you use 
              our platform.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. How Thrift Uses Cookies</h2>
            <p>
              We use cookies to enhance your experience on our platform that connects students with exclusive 
              deals and discounts from trusted brands. Our cookies help us:
            </p>
            <ul>
              <li>Keep you logged into your account</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze how our platform is used</li>
              <li>Provide personalized content and offers</li>
              <li>Ensure security and prevent fraud</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Types of Cookies We Use</h2>
            
            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for our website to function properly. They enable basic features like 
              page navigation, account access, and secure areas of the website.
            </p>
            
            <h3>Performance Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting anonymous 
              information about page visits, time spent on pages, and any error messages.
            </p>
            
            <h3>Functionality Cookies</h3>
            <p>
              These cookies allow our website to remember choices you make (such as language preferences) and 
              provide enhanced, personalized features.
            </p>
            
            <h3>Targeting/Advertising Cookies</h3>
            <p>
              These cookies are used to deliver relevant offers and advertisements based on your interests and 
              browsing behavior.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Third-Party Cookies</h2>
            <p>
              We may also use third-party cookies from our brand partners and service providers to:
            </p>
            <ul>
              <li>Track the effectiveness of student discount campaigns</li>
              <li>Provide analytics and insights</li>
              <li>Enable social media features</li>
              <li>Process payments securely</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Student Privacy Protection</h2>
            <p>
              We are committed to protecting student privacy. Any cookies related to student verification or 
              educational status are handled with extra care and in compliance with educational privacy standards.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Managing Your Cookie Preferences</h2>
            <p>You have several options for managing cookies:</p>
            
            <h3>Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can choose to:
            </p>
            <ul>
              <li>Block all cookies</li>
              <li>Allow only first-party cookies</li>
              <li>Delete existing cookies</li>
              <li>Receive notifications when cookies are being set</li>
            </ul>
            
            <h3>Opt-Out Tools</h3>
            <p>
              You can opt out of targeted advertising cookies using industry tools like the Digital Advertising 
              Alliance's opt-out page.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Impact of Disabling Cookies</h2>
            <p>
              If you choose to disable cookies, some features of our platform may not work properly:
            </p>
            <ul>
              <li>You may need to log in each time you visit</li>
              <li>Your preferences may not be saved</li>
              <li>Some personalized features may not be available</li>
              <li>Student verification processes may be affected</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>8. Cookie Retention</h2>
            <p>
              Different cookies have different retention periods:
            </p>
            <ul>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
              <li><strong>Authentication Cookies:</strong> Expire when you log out or after a period of inactivity</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>9. Updates to Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              operational, legal, or regulatory reasons. We will notify you of any significant changes.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us 
              through our <a href="/contact"> contact page</a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CookiePolicy;
