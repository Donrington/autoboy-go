import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight, faEnvelope, faQuestionCircle, faAt, faComments,
  faStar, faUsers, faLink, faArrowUp, faMobileAlt, faHeadphones,
  faTag, faStore, faSun, faMoon
} from '@fortawesome/free-solid-svg-icons';
import { faXTwitter, faInstagram, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import iphoneImage from '../assets/images/mockups/iphone15promax-portrait.png';
import autoboyLogo from '../assets/autoboy_logo2.png';
import autoboyFooterLogo from '../assets/autoboy_logo3.png';

// Import CSS files
import './ProductDetails.css';

const ProductDetails = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [activeStorage, setActiveStorage] = useState('512GB');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemDark);
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Apply dark mode class to body and save preference
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = () => {
    // Add to cart functionality
    alert('Added to cart!');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleStorageChange = (storage) => {
    setActiveStorage(storage);
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <div className={`product-details ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Floating Particles */}
      <div className="autoboy-pd-floating-particles"></div>

      {/* Main Content */}
      <div className="autoboy-pd-container" style={{paddingTop: '120px', display: 'block', visibility: 'visible', opacity: 1}}>
        {/* Breadcrumb */}
        <nav className="autoboy-pd-breadcrumb">
          <a href="#">Home</a>
          <span>/</span>
          <a href="#">Smartphones</a>
          <span>/</span>
          <a href="#">Smartphones</a>
          <span>/</span>
          <span>iPhone 16 Pro Max - 5G</span>
        </nav>

        {/* Main Product Grid */}
        <div className="autoboy-pd-main-grid">
          {/* Product Section */}
          <div className="autoboy-pd-product-section">
            <div className="autoboy-pd-product-header">
              <div className="autoboy-pd-product-image-container">
                <div className="autoboy-pd-floating-glow"></div>
                <img src={iphoneImage} alt="iPhone 16 Pro Max" className="autoboy-pd-product-image" />
              </div>
              <div className="autoboy-pd-product-info">
                <h1 className="autoboy-pd-product-title">Apple iPhone 16 Pro Max</h1>
                <div className="autoboy-pd-product-price">₦2,800,000</div>

                <div className="autoboy-pd-rating-container">
                  <div className="autoboy-pd-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="autoboy-pd-star">★</span>
                    ))}
                  </div>
                </div>

                <div className="autoboy-pd-storage-options">
                  {['128GB', '256GB', '512GB', '1TB'].map((storage) => (
                    <button
                      key={storage}
                      className={`autoboy-pd-storage-btn ${activeStorage === storage ? 'autoboy-pd-active' : ''}`}
                      onClick={() => handleStorageChange(storage)}
                    >
                      {storage}
                    </button>
                  ))}
                </div>

                <p className="autoboy-pd-color-info">
                  Black • White • Natural Titanium • Desert Titanium (Gold/Bronze)
                </p>

                <button className="autoboy-pd-add-to-cart" onClick={handleAddToCart}>
                  Add to cart
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="autoboy-pd-sidebar">
            {/* Delivery Card */}
            <div className="autoboy-pd-delivery-card">
              <h3 className="autoboy-pd-card-title">Delivery & Returns</h3>
              <p style={{marginBottom: '1rem', fontSize: '0.9rem'}}>Choose your Location</p>

              <select className="autoboy-pd-location-select">
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
                <option>Kano</option>
              </select>

              <select className="autoboy-pd-location-select">
                <option>Lekki</option>
                <option>Victoria Island</option>
                <option>Ikeja</option>
                <option>Surulere</option>
              </select>
            </div>

            {/* Seller Card */}
            <div className="autoboy-pd-seller-card">
              <h3 className="autoboy-pd-card-title">Seller Information</h3>

              <div className="autoboy-pd-seller-info">
                <div className="autoboy-pd-seller-name">Marcel Woods</div>
                <div className="autoboy-pd-seller-score">98% Seller Score</div>
                <div className="autoboy-pd-followers">2036 Followers</div>

                <button
                  className="autoboy-pd-follow-btn"
                  onClick={toggleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>

                <div className="autoboy-pd-card-title" style={{margin: '1rem 0 0.5rem'}}>
                  Seller Performance
                </div>

                <div className="autoboy-pd-performance-indicators">
                  <div className="autoboy-pd-indicator">
                    <div className="autoboy-pd-indicator-icon">✓</div>
                    <span>Shipping speed: Excellent</span>
                  </div>
                  <div className="autoboy-pd-indicator">
                    <div className="autoboy-pd-indicator-icon">✓</div>
                    <span>Quality Score: Excellent</span>
                  </div>
                  <div className="autoboy-pd-indicator">
                    <div className="autoboy-pd-indicator-icon">✓</div>
                    <span>Customer Rating: Excellent</span>
                  </div>
                </div>

                <div className="autoboy-pd-card-title" style={{margin: '1rem 0 0.5rem'}}>
                  Start a Chat
                </div>
                <button className="autoboy-pd-chat-btn">Chat</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="autoboy-pd-tabs-section">
          <div className="autoboy-pd-tabs-nav">
            <button
              className={`autoboy-pd-tab-btn ${activeTab === 'about' ? 'autoboy-pd-active' : ''}`}
              onClick={() => handleTabChange('about')}
            >
              About iPhone
            </button>
            <button
              className={`autoboy-pd-tab-btn ${activeTab === 'specs' ? 'autoboy-pd-active' : ''}`}
              onClick={() => handleTabChange('specs')}
            >
              Specifications
            </button>
            <button
              className={`autoboy-pd-tab-btn ${activeTab === 'reviews' ? 'autoboy-pd-active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              Reviews
            </button>
          </div>

          <div className="autoboy-pd-tab-content">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="autoboy-pd-tab-pane autoboy-pd-active">
                <div className="autoboy-pd-features-grid">
                  <div className="autoboy-pd-feature-category">
                    <h4>Key Features</h4>
                    <ul className="autoboy-pd-feature-list">
                      <li>Manufacturer - Apple</li>
                      <li>Operating System - iOS 18</li>
                      <li>Rear Camera - 48MP</li>
                      <li>Front Camera - 12MP</li>
                      <li>Ram - 8GB</li>
                      <li>Internal Memory - 512GB</li>
                      <li>Sim Type - Nano Sim</li>
                      <li>Screen Size - 6.9 Inches</li>
                      <li>Processor - Apple A18 Pro</li>
                      <li>5G - Yes</li>
                      <li>Battery Capacity - Li-Po 4,685 mAh</li>
                      <li>Charging - Wired</li>
                    </ul>
                  </div>
                  <div className="autoboy-pd-feature-category">
                    <h4>Specifications</h4>
                    <ul className="autoboy-pd-feature-list">
                      <li>SKU: AP044MP5HQ12LNAFAMZ</li>
                      <li>Product Line: Just Fones</li>
                      <li>Model: iPhone 16 Pro Max</li>
                      <li>Weight (kg): 0.5</li>
                      <li>Color: Black</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="autoboy-pd-tab-pane autoboy-pd-active">
                <div className="autoboy-pd-features-grid">
                  <div className="autoboy-pd-feature-category">
                    <h4>Display & Design</h4>
                    <ul className="autoboy-pd-feature-list">
                      <li>Display: 6.9" Super Retina XDR OLED</li>
                      <li>Resolution: 2868 x 1320 pixels</li>
                      <li>Refresh Rate: 120Hz ProMotion</li>
                      <li>Brightness: 2000 nits peak</li>
                      <li>Materials: Titanium frame, Ceramic Shield</li>
                      <li>Water Resistance: IP68</li>
                      <li>Dimensions: 163.0 x 77.6 x 8.25 mm</li>
                      <li>Weight: 227g</li>
                    </ul>
                  </div>
                  <div className="autoboy-pd-feature-category">
                    <h4>Performance & Storage</h4>
                    <ul className="autoboy-pd-feature-list">
                      <li>Chip: A18 Pro with 6-core CPU</li>
                      <li>GPU: 6-core graphics</li>
                      <li>Neural Engine: 16-core</li>
                      <li>RAM: 8GB unified memory</li>
                      <li>Storage: 512GB internal</li>
                      <li>Operating System: iOS 18</li>
                      <li>5G: Sub-6 GHz and mmWave</li>
                      <li>Wi-Fi: Wi-Fi 7 (802.11be)</li>
                    </ul>
                  </div>
                  <div className="autoboy-pd-feature-category">
                    <h4>Camera System</h4>
                    <ul className="autoboy-pd-feature-list">
                      <li>Main: 48MP Fusion camera</li>
                      <li>Ultra Wide: 48MP, 13mm</li>
                      <li>Telephoto: 12MP, 5x optical zoom</li>
                      <li>Front: 12MP TrueDepth</li>
                      <li>Video: 4K Dolby Vision HDR</li>
                      <li>Action Mode: Advanced stabilization</li>
                      <li>Cinematic Mode: 4K at 30fps</li>
                      <li>ProRAW: 48MP capture</li>
                    </ul>
                  </div>
                  <div className="autoboy-pd-feature-category">
                    <h4>Battery & Charging</h4>
                    <ul className="autoboy-pd-feature-list">
                      <li>Battery: Li-Ion 4685 mAh</li>
                      <li>Video Playback: Up to 29 hours</li>
                      <li>Wired Charging: USB-C, up to 27W</li>
                      <li>Wireless: 15W MagSafe, 7.5W Qi</li>
                      <li>Fast Charging: 50% in 30 minutes</li>
                      <li>Power Delivery: USB-C PD 3.0</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="autoboy-pd-tab-pane autoboy-pd-active">
                <div className="autoboy-pd-review-summary">
                  <div className="autoboy-pd-rating-overview">
                    <div className="autoboy-pd-rating-number">
                      5 <span style={{fontSize: '1.5rem'}}>★</span>
                    </div>
                    <p style={{color: 'var(--text-light-secondary)', marginTop: '0.5rem'}}>
                      Based on customer reviews
                    </p>
                  </div>
                  <div className="autoboy-pd-rating-breakdown">
                    <div className="autoboy-pd-rating-bars">
                      {[
                        { stars: 5, count: 60, width: 60 },
                        { stars: 4, count: 27, width: 27 },
                        { stars: 3, count: 54, width: 54 },
                        { stars: 2, count: 35, width: 35 },
                        { stars: 1, count: 5, width: 5 }
                      ].map((rating) => (
                        <div key={rating.stars} className="autoboy-pd-rating-bar">
                          <span>{rating.stars}</span>
                          <span style={{color: '#fbbf24'}}>★</span>
                          <div className="autoboy-pd-bar-container">
                            <div
                              className="autoboy-pd-bar-fill"
                              style={{width: `${rating.width}%`}}
                            ></div>
                          </div>
                          <span>({rating.count.toString().padStart(2, '0')})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{marginTop: '2rem'}}>
                  <h4 style={{marginBottom: '1rem', color: 'var(--text-light)'}}>Recent Reviews</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    <div style={{
                      padding: '1.5rem',
                      background: 'var(--bg-light-secondary)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <strong>John D.</strong>
                        <div className="autoboy-pd-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="autoboy-pd-star">★</span>
                          ))}
                        </div>
                      </div>
                      <p style={{color: 'var(--text-light-secondary)', fontSize: '0.9rem'}}>
                        "Excellent phone with amazing camera quality. Fast delivery and great packaging. Highly recommended!"
                      </p>
                      <small style={{color: 'var(--text-light-tertiary)'}}>
                        Verified Purchase • 2 days ago
                      </small>
                    </div>
                    <div style={{
                      padding: '1.5rem',
                      background: 'var(--bg-light-secondary)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <strong>Sarah M.</strong>
                        <div className="autoboy-pd-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="autoboy-pd-star">★</span>
                          ))}
                        </div>
                      </div>
                      <p style={{color: 'var(--text-light-secondary)', fontSize: '0.9rem'}}>
                        "Perfect condition, exactly as described. The seller was very responsive and helpful. Will buy again!"
                      </p>
                      <small style={{color: 'var(--text-light-tertiary)'}}>
                        Verified Purchase • 1 week ago
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="autoboy-cta-banner">
        <div className="autoboy-cta-decorative-elements">
          <div className="autoboy-cta-shape autoboy-cta-shape-1"></div>
          <div className="autoboy-cta-shape autoboy-cta-shape-2"></div>
          <div className="autoboy-cta-shape autoboy-cta-shape-3"></div>
          <div className="autoboy-cta-shape autoboy-cta-shape-4"></div>
          <div className="autoboy-cta-shape autoboy-cta-shape-5"></div>
        </div>

        <div className="autoboy-cta-particles"></div>

        <div className="autoboy-cta-content-wrapper">
          <div className="autoboy-cta-text-section">
            <h2 className="autoboy-cta-main-heading">Shop Smarter.<br />Live Sharper.</h2>
            <p className="autoboy-cta-tagline">Autoboy's Got Your Tech</p>
            <a href="/shop" className="autoboy-cta-action-button">
              <span>Shop Now</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </a>
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

export default ProductDetails;