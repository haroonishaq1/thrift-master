import React from 'react';
import '../styles/Footer.css';
import { FaTiktok, FaInstagram, FaFacebookF } from 'react-icons/fa';

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-main">
          <div className="footer-navigation">
            <div className="footer-nav-top">
              <div className="footer-links-left">
                <a href="/contact">contact</a>
                <a href="/pursue">Pursue</a>
                <a href="/press">press</a>
                <a href="/career">career</a>
                <a href="/imprint">imprint</a>
              </div>
              <div className="footer-social-links">
                <a href="https://tiktok.com" aria-label="TikTok"><FaTiktok /></a>
                <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
                <a href="https://facebook.com" aria-label="Facebook"><FaFacebookF /></a>
              </div>
            </div>
            
            <div className="footer-app-section">
              <div className="footer-app-logo">
                <div className="unidays-logo">T</div>
              </div>
              <div className="footer-app-stores">
                <a href="https://apps.apple.com" className="app-store-badge">
                  <img src="/images/app-store-badge.png" alt="Download on App Store" />
                </a>
                <a href="https://play.google.com" className="play-store-badge">
                  <img src="/images/play-store-badge.png" alt="Get it on Google Play" />
                </a>
              </div>
              <div className="footer-app-rating">
                <div className="rating-number">4.8</div>
                <div className="rating-stars">★ ★ ★ ★ ★</div>
                <div className="rating-count">36k reviews</div>
              </div>
            </div>
            
            <div className="footer-nav-bottom">
              <div className="footer-links-bottom">
                <a href="/support">Support</a>
                <a href="/terms">Terms of Service</a>
                <a href="/cookie-policy">Cookie Policy</a>
                <a href="/cookie-settings">Cookie settings</a>
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/accessibility">accessibility</a>
                <a href="/advertising">Advertising information</a>
                <a href="/logout">Log out</a>
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
