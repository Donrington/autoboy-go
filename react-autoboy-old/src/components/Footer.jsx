import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import footerLogo from '../assets/autoboy_logo3.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  const particlesRef = useRef(null);

  // Create floating particles effect
  useEffect(() => {
    const createParticles = () => {
      const container = particlesRef.current;
      if (!container) return;

      // Clear existing particles
      container.innerHTML = '';

      // Create particles
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'footer-particle';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;
        
        particle.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x}%;
          bottom: -10px;
          animation-delay: ${delay}s;
          animation-duration: ${duration}s;
          background: rgba(34, 197, 94, ${Math.random() * 0.5 + 0.1});
        `;
        
        container.appendChild(particle);
      }
    };

    createParticles();
    const interval = setInterval(createParticles, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      // Add your newsletter signup logic here
      setEmail('');
      alert('Thank you for subscribing!');
    }
  };

  return (
    <footer className="footer">
      {/* Background Layers */}
      <div className="footer-bg"></div>
      <div className="footer-gradient"></div>
      
      {/* Floating Particles */}
      <div className="footer-particles" ref={particlesRef}></div>

      {/* Glass Container */}
      <div className="footer-glass">
        {/* Top Navigation */}
        <nav className="footer-nav">
          <div className="footer-nav-content">
            <a href="#" className="footer-logo">
              <div className="footer-logo-text">
                <img src={footerLogo} alt="Autoboy Logo" />
              </div>
            </a>
            
            <div className="footer-nav-links">
              <a href="/shop" className="footer-nav-link">Buy Now</a>
              <a href="#" className="footer-nav-link">Sell Now</a>
              <a href="#" className="footer-nav-link">Swap Gadgets</a>
            </div>
            
            <div className="footer-auth">
              <a href="/login" className="footer-btn footer-btn-outline">Join</a>
              <a href="/login" className="footer-btn footer-btn-primary">Login</a>
            </div>
          </div>
        </nav>

        {/* Main Footer Content */}
        <div className="footer-content">
          <div className="footer-grid">
            {/* Explore Our Range */}
            <div className="footer-column">
              <h3><i className="fas fa-store"></i> Explore Our Range</h3>
              <div className="footer-links">
                <a href="#" className="footer-link">
                  <i className="fas fa-mobile-alt"></i>
                  <span>
                    <strong>Latest Phones</strong><br />
                    <small>Discover the newest smartphones available today.</small>
                  </span>
                </a>
                <a href="#" className="footer-link">
                  <i className="fas fa-headphones"></i>
                  <span>
                    <strong>Top Accessories</strong><br />
                    <small>Find the perfect accessories for your gadgets.</small>
                  </span>
                </a>
                <a href="#" className="footer-link">
                  <i className="fas fa-tags"></i>
                  <span>
                    <strong>Trending Deals</strong><br />
                    <small>Unbeatable prices on selected electronic devices.</small>
                  </span>
                </a>
                <a href="#" className="footer-link">
                  <i className="fas fa-headset"></i>
                  <span>
                    <strong>Customer Support</strong><br />
                    <small>We're here to help you with any questions.</small>
                  </span>
                </a>
              </div>
            </div>

            {/* Contact Us */}
            <div className="footer-column">
              <h3><i className="fas fa-envelope"></i> Contact Us</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-question-circle"></i>
                  <span>
                    <strong>FAQs</strong><br />
                    Find answers to common customer queries.
                  </span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-at"></i>
                  <span>
                    <a href="mailto:Autoboy@ng.com" className="contact-link">Autoboy@ng.com</a><br />
                    Reach out for further assistance or inquiries.
                  </span>
                </div>
                <motion.a 
                  href="#" 
                  className="live-chat-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-comments"></i>
                  Live Chat Support
                </motion.a>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="footer-column">
              <h3><i className="fas fa-users"></i> Community Engagement</h3>
              <div className="footer-links">
                <a href="#" className="footer-link">
                  <i className="fas fa-star"></i>
                  <span>
                    <strong>User Reviews</strong><br />
                    <small>Read what others say about their purchases.</small>
                  </span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column quick">
              <h3><i className="fas fa-link"></i> Quick Links</h3>
              <div className="footer-links">
                <a href="#" className="footer-link">Help Centre</a>
                <a href="#" className="footer-link">Terms of Use</a>
                <a href="#" className="footer-link">Return Policy</a>
                <a href="#" className="footer-link">Shipping Info</a>
                <a href="#" className="footer-link">Feedback</a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="newsletter-section">
              <h3 className="newsletter-title">Stay Connected</h3>
              <p className="newsletter-subtitle">Get the latest deals and updates delivered to your inbox</p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  className="newsletter-input" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <motion.button 
                  type="submit" 
                  className="newsletter-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              @2025 AutoBoy - All rights reserved
            </div>
            
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Terms and condition</a>
              <a href="#" className="footer-legal-link">Privacy policy</a>
              <a href="#" className="footer-legal-link">Cookie policy</a>
            </div>
            
            <div className="footer-social">
              <motion.a 
                href="#" 
                className="social-link" 
                data-tooltip="Follow us on X"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fab fa-x-twitter"></i>
              </motion.a>
              <motion.a 
                href="#" 
                className="social-link" 
                data-tooltip="Follow us on Instagram"
                whileHover={{ scale: 1.2, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fab fa-instagram"></i>
              </motion.a>
              <motion.a 
                href="#" 
                className="social-link" 
                data-tooltip="Like us on Facebook"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="fab fa-facebook-f"></i>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;