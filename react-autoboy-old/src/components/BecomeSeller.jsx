import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faHeadset, faShippingFast, faChartLine,
  faUserPlus, faStore, faBoxOpen, faRocket,
  faMobileAlt, faHeadphones, faTags, faEnvelope,
  faQuestionCircle, faAt, faComments, faStar,
  faUsers as faUsersIcon, faLink, faSun, faMoon,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { faXTwitter, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';

// Import CSS files
import '../assets/becomeseller.css';
import '../assets/styles.css';
import './BecomeSeller.css';

const BecomeSeller = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemDark);
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`become-seller-page ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Hero Section */}
      <section className="seller-hero" style={{paddingTop: '120px'}}>
        <div className="seller-hero-container">
          <div className="seller-hero-content">
            <h1 className="seller-hero-title">Become a Seller</h1>
            <p className="seller-hero-subtitle">
              Start your journey with Autoboy and reach millions of customers across Nigeria.
              Join our growing marketplace today!
            </p>
            <a href="/seller-signin" className="seller-hero-cta">Get Started Now</a>
          </div>
          <div className="seller-hero-visual">
            <div className="seller-visual-frame"></div>
            <div className="seller-3d-boxes"></div>
            <div className="seller-3d-character"></div>
          </div>
        </div>
      </section>

      {/* Why Sell on Autoboy */}
      <section className="seller-benefits">
        <div className="seller-benefits-container">
          <div className="seller-benefits-header">
            <h2 className="seller-benefits-title fade-up">Why sell on Autoboy</h2>
          </div>
          <div className="seller-benefits-grid">
            <div className="seller-benefit-card">
              <FontAwesomeIcon icon={faUsers} className="seller-benefit-icon" />
              <h3 className="seller-benefit-title">Connect with more buyers</h3>
              <p className="seller-benefit-desc">
                Access our vast network of verified buyers actively looking for quality gadgets
              </p>
            </div>
            <div className="seller-benefit-card">
              <FontAwesomeIcon icon={faHeadset} className="seller-benefit-icon" />
              <h3 className="seller-benefit-title">Best Seller Support</h3>
              <p className="seller-benefit-desc">
                24/7 dedicated support team to help you succeed in your selling journey
              </p>
            </div>
            <div className="seller-benefit-card">
              <FontAwesomeIcon icon={faShippingFast} className="seller-benefit-icon" />
              <h3 className="seller-benefit-title">Best Product Delivery</h3>
              <p className="seller-benefit-desc">
                Reliable logistics partners ensure your products reach customers safely
              </p>
            </div>
            <div className="seller-benefit-card">
              <FontAwesomeIcon icon={faChartLine} className="seller-benefit-icon" />
              <h3 className="seller-benefit-title">Improve Revenue</h3>
              <p className="seller-benefit-desc">
                Boost your sales with our marketing tools and data-driven insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Enroll */}
      <section className="seller-enrollment" id="enroll">
        <div className="seller-enrollment-container">
          <div className="seller-enrollment-header">
            <h2 className="seller-enrollment-title fade-up">How to Enroll</h2>
          </div>
          <div className="seller-steps-grid">
            <div className="seller-step-card">
              <div className="seller-step-number">1</div>
              <div className="seller-step-icon">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <h3 className="seller-step-title">Register Your Account</h3>
              <p className="seller-step-desc">
                <span className="seller-step-highlight">Step 1:</span> Register under 5 minutes.
                Fill the registration form and submit the required documents:
                <br /><br />
                <strong>(a)</strong> Business registration<br />
                <strong>(b)</strong> Bank account details
              </p>
            </div>
            <div className="seller-step-card">
              <div className="seller-step-number">2</div>
              <div className="seller-step-icon">
                <FontAwesomeIcon icon={faStore} />
              </div>
              <h3 className="seller-step-title">Setup Your Store</h3>
              <p className="seller-step-desc">
                <span className="seller-step-highlight">Step 2:</span> Become an ecommerce expert.
                Complete the dedicated new seller training and activate your seller center
                account to manage your shop.
              </p>
            </div>
            <div className="seller-step-card">
              <div className="seller-step-number">3</div>
              <div className="seller-step-icon">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h3 className="seller-step-title">List Your Products</h3>
              <p className="seller-step-desc">
                <span className="seller-step-highlight">Step 3:</span> List your products and sell.
                Upload your best selling products and start selling to millions of customers.
              </p>
            </div>
            <div className="seller-step-card">
              <div className="seller-step-number">4</div>
              <div className="seller-step-icon">
                <FontAwesomeIcon icon={faRocket} />
              </div>
              <h3 className="seller-step-title">Grow Your Business</h3>
              <p className="seller-step-desc">
                <span className="seller-step-highlight">Step 4:</span> Benefit from our promotions
                and marketing. Get visibility from our campaigns/promotions and insights on
                best selling products.
              </p>
            </div>
          </div>
          <div className="seller-enroll-cta">
            <a href="/seller-signin" className="seller-enroll-btn">Enroll Now</a>
          </div>
        </div>
      </section>

      {/* Theme Toggle */}
      <div className="theme-toggle" onClick={toggleTheme}>
        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop}>
          <svg className="progress-ring" viewBox="0 0 56 56">
            <circle className="progress-ring__circle" cx="28" cy="28" r="26"></circle>
          </svg>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </div>
  );
};

export default BecomeSeller;