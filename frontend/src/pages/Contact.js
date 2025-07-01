import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SuccessPopup from '../components/SuccessPopup';
import { contactAPI } from '../services/api';
import '../styles/Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Message is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await contactAPI.sendMessage(formData);

      if (response.success) {
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          description: ''
        });
        
        setSuccessMessage(response.message || 'We will get back to you soon.');
        setShowSuccessPopup(true);
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Header />
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-header">
            <h1>Contact Us</h1>
            <p>Have a question or need help? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Message *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? 'error' : ''}
                  placeholder="Tell us how we can help you..."
                  rows="6"
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          <div className="contact-info">
            <div className="contact-info-section">
              <h3>Get in Touch</h3>
              <p>We're here to help students and brands connect. Whether you have questions about our platform, need technical support, or want to partner with us, we're ready to assist.</p>
            </div>

            <div className="contact-info-section">
              <h3>For Students</h3>
              <p>Having trouble with your account or finding the right deals? Our support team is here to help you make the most of your student discounts.</p>
            </div>

            <div className="contact-info-section">
              <h3>For Brands</h3>
              <p>Interested in partnering with us to reach students? We'd love to discuss how we can help you connect with our student community.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      <SuccessPopup 
        isVisible={showSuccessPopup}
        message={successMessage}
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}

export default Contact;
