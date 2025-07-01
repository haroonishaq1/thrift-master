import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-navigation">
            <div className="footer-brand-section">
              <div className="footer-brand">
                <h3 className="footer-brand-name">Thrift</h3>
                <p className="footer-brand-description">Connecting students with exclusive deals and discounts from trusted brands</p>
              </div>
            </div>
            
            <div className="footer-nav-bottom">
              <div className="footer-links-bottom">
                <a href="/contact">Contact</a>
                <a href="/terms">Terms of Service</a>
                <a href="/cookie-policy">Cookie Policy</a>
                <a href="/privacy-policy">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p>Copyright © Thrift. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
