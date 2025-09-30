import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../assets/css/homepage.css';

// Import API services (for future Django integration)
// import { productsAPI, categoriesAPI } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [flashSaleTime, setFlashSaleTime] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56
  });
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  // Sample data (replace with Django API calls)
  const sampleProducts = [
    {
      id: 1,
      name: "iPhone 16 Pro Max",
      price: "₦1,450,000",
      originalPrice: "₦1,650,000",
      discount: "12%",
      image: "https://images.unsplash.com/photo-1664114780064-41d0dd873e92?w=500&auto=format&fit=crop&q=60",
      category: "smartphones",
      condition: "Brand New",
      rating: 4.8,
      reviews: 124,
      isHot: true
    },
    {
      id: 2,
      name: "MacBook Pro M4",
      price: "₦2,250,000",
      originalPrice: "₦2,500,000",
      discount: "10%",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
      category: "laptops",
      condition: "UK Used",
      rating: 4.9,
      reviews: 89,
      isNew: true
    },
    {
      id: 3,
      name: "Galaxy S25 Ultra",
      price: "₦1,120,000",
      originalPrice: "₦1,350,000",
      discount: "17%",
      image: "https://www.pointekonline.com/wp-content/uploads/2025/01/sms938_galaxys25ultra_front_titaniumblack_5506351.png",
      category: "smartphones",
      condition: "Nigerian Used",
      rating: 4.7,
      reviews: 156,
      isTrending: true
    },
    {
      id: 4,
      name: "iPad Pro 2024",
      price: "₦850,000",
      originalPrice: "₦950,000",
      discount: "11%",
      image: "https://images.unsplash.com/photo-1661340272675-f6829791246e?q=80&w=764&auto=format&fit=crop",
      category: "tablets",
      condition: "UK Used",
      rating: 4.6,
      reviews: 203,
      isHot: true
    },
    {
      id: 5,
      name: "Gaming PC Ultra",
      price: "₦1,850,000",
      originalPrice: "₦2,100,000",
      discount: "12%",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60",
      category: "computers",
      condition: "Brand New",
      rating: 4.8,
      reviews: 67,
      isNew: true
    },
    {
      id: 6,
      name: "AirPods Pro Max",
      price: "₦450,000",
      originalPrice: "₦520,000",
      discount: "13%",
      image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500&auto=format&fit=crop&q=60",
      category: "audio",
      condition: "UK Used",
      rating: 4.5,
      reviews: 98,
      isTrending: true
    }
  ];

  const sampleCategories = [
    { 
      id: 1, 
      name: "Phones", 
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=150&fit=crop" 
    },
    { 
      id: 2, 
      name: "Airpods", 
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=150&fit=crop" 
    },
    { 
      id: 3, 
      name: "Laptops", 
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=150&fit=crop" 
    },
    { 
      id: 4, 
      name: "Smartwatches", 
      image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&h=150&fit=crop" 
    },
    { 
      id: 5, 
      name: "Consoles", 
      image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=200&h=150&fit=crop" 
    },
    { 
      id: 6, 
      name: "Headphones", 
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=150&fit=crop" 
    }
  ];


  useEffect(() => {
    // Simulate API call to Django backend
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual Django API calls:
        // const productsResponse = await productsAPI.getFeatured();
        // const categoriesResponse = await categoriesAPI.getAll();
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProducts(sampleProducts);
        setCategories(sampleCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // GSAP Animations for floating orbs
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      gsap.to(orb2Ref.current, {
        x: 50,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

      gsap.to(orb3Ref.current, {
        scale: 1.2,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Flash Sale Countdown Timer
    const interval = setInterval(() => {
      setFlashSaleTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer when it reaches zero
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search with Django API
    console.log('Searching for:', searchQuery);
  };

  const handleProductClick = (productId) => {
    // TODO: Navigate to product detail page
    console.log('Product clicked:', productId);
  };

  const handleCategoryClick = (categoryId) => {
    // TODO: Navigate to category page with Django API filter
    console.log('Category clicked:', categoryId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price.replace(/[₦,]/g, ''));
  };

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      alert('🎉 Welcome to Autoboy! Check your email for a 10% discount code.');
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="autoboy-hero-section">
        <div className="autoboy-hero-bg-animation">
          <div ref={orb1Ref} className="autoboy-floating-orb autoboy-orb-1"></div>
          <div ref={orb2Ref} className="autoboy-floating-orb autoboy-orb-2"></div>
          <div ref={orb3Ref} className="autoboy-floating-orb autoboy-orb-3"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="autoboy-hero-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="autoboy-hero-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Gadget Icons Floating */}
        <div className="autoboy-hero-gadget-icons">
          <motion.div 
            className="autoboy-gadget-icon autoboy-icon-1"
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <i className="fas fa-mobile-alt"></i>
          </motion.div>
          
          <motion.div 
            className="autoboy-gadget-icon autoboy-icon-2"
            animate={{
              y: [15, -25, 15],
              x: [-10, 10, -10],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <i className="fas fa-laptop"></i>
          </motion.div>
          
          <motion.div 
            className="autoboy-gadget-icon autoboy-icon-3"
            animate={{
              y: [-10, 25, -10],
              rotate: [0, -360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            <i className="fas fa-headphones"></i>
          </motion.div>
          
          <motion.div 
            className="autoboy-gadget-icon autoboy-icon-4"
            animate={{
              y: [20, -15, 20],
              x: [10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          >
            <i className="fas fa-tablet-alt"></i>
          </motion.div>
          
          <motion.div 
            className="autoboy-gadget-icon autoboy-icon-5"
            animate={{
              y: [-15, 30, -15],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          >
            <i className="fas fa-camera"></i>
          </motion.div>
          
          <motion.div 
            className="autoboy-gadget-icon autoboy-icon-6"
            animate={{
              y: [25, -20, 25],
              x: [-15, 15, -15],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          >
            <i className="fas fa-gamepad"></i>
          </motion.div>
        </div>
        
        <div className="autoboy-hero-container">
          <motion.div 
            className="autoboy-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="autoboy-hero-inner">
              <div className="autoboy-hero-text">
                <motion.h2 
                  className="autoboy-hero-subtitle"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Welcome to Autoboy
                </motion.h2>
                <motion.h1 
                  className="autoboy-hero-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  Buy, Sell,
                  <span className="autoboy-gradient-text"> Swap Gadgets.</span>
                </motion.h1>
                <motion.p 
                  className="autoboy-hero-description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  Your ultimate destination for premium gadgets. Buy the latest smartphones, sell your old devices, 
                  or swap for something new. Experience unbeatable deals on electronics you love.
                </motion.p>
                <motion.div 
                  className="autoboy-hero-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  <motion.a 
                    href="/shop" 
                    className="autoboy-btn autoboy-btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fas fa-shopping-bag"></i>
                    Shop Now
                  </motion.a>
                  <motion.button 
                    className="autoboy-btn autoboy-btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      document.querySelector('.autoboy-deals-section')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                  >
                    <i className="fas fa-bolt"></i>
                    Browse Gadgets
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="flash-sale-banner">
        <div className="flash-sale-container">
          <motion.div
            className="flash-sale-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flash-sale-text">
              <i className="fas fa-bolt flash-sale-icon"></i>
              <h3 className="flash-sale-title">Flash Sale - Limited Time!</h3>
              <p className="flash-sale-subtitle">Up to 25% off on selected gadgets</p>
            </div>
            <div className="flash-sale-timer">
              <div className="timer-label">Deal expires in:</div>
              <div className="countdown-timer">
                <div className="time-unit">
                  <span className="time-value">{String(flashSaleTime.hours).padStart(2, '0')}</span>
                  <span className="time-label">Hours</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-value">{String(flashSaleTime.minutes).padStart(2, '0')}</span>
                  <span className="time-label">Minutes</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-value">{String(flashSaleTime.seconds).padStart(2, '0')}</span>
                  <span className="time-label">Seconds</span>
                </div>
              </div>
            </div>
            <motion.a
              href="/shop"
              className="flash-sale-cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Shop Flash Deals
              <i className="fas fa-bolt"></i>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="autoboy-products-section">
        {/* Animated Background */}
        <div className="autoboy-bg-animation">
          <div ref={orb1Ref} className="autoboy-floating-orb autoboy-orb-1"></div>
          <div ref={orb2Ref} className="autoboy-floating-orb autoboy-orb-2"></div>
          <div ref={orb3Ref} className="autoboy-floating-orb autoboy-orb-3"></div>
        </div>

        <div className="autoboy-products-container">
          {/* Categories */}
          <div className="autoboy-categories-section">
            <motion.div 
              className="autoboy-section-header force-visible"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="autoboy-section-title force-visible">Categories</h2>
              <motion.a 
                href="/shop" 
                className="autoboy-more-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>More</span>
                <i className="fas fa-arrow-right"></i>
              </motion.a>
            </motion.div>
            
            <motion.div 
              className="autoboy-categories-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              id="autoboyCategories"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  className="autoboy-category-card"
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 100}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="autoboy-category-image" 
                  />
                  <h3 className="autoboy-category-name">{category.name}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Deals of the Week */}
          <div className="autoboy-deals-section">
            <motion.div 
              className="autoboy-section-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="autoboy-section-title force-visible">Deals of the week</h2>
              <motion.a 
                href="/shop" 
                className="autoboy-more-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>More</span>
                <i className="fas fa-arrow-right"></i>
              </motion.a>
            </motion.div>

            {/* Deals Grid */}
            <motion.div 
              className="autoboy-deals-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              id="autoboyDeals"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="autoboy-deal-card"
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 100}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Product Image Container */}
                  <div className="autoboy-deal-image-container">
                    <img src={product.image} alt={product.name} className="autoboy-deal-image" />
                    
                    {/* Product Badges */}
                    <div className="autoboy-product-badges">
                      {product.isHot && <span className="autoboy-deal-badge hot"><i className="fas fa-fire"></i> Hot</span>}
                      {product.isNew && <span className="autoboy-deal-badge new"><i className="fas fa-certificate"></i> New</span>}
                      {product.isTrending && <span className="autoboy-deal-badge trending"><i className="fas fa-chart-line"></i> Trending</span>}
                      {product.discount && (
                        <span className="autoboy-deal-badge discount">-{product.discount}</span>
                      )}
                    </div>
                    
                    {/* Favorite Button */}
                    <button className="autoboy-favorite-btn">
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="autoboy-deal-info">
                    <h3 className="autoboy-deal-name">{product.name}</h3>
                    
                    {/* Product Specs */}
                    <div className="autoboy-product-specs">
                      <span className="autoboy-spec-tag">{product.condition}</span>
                      <span className="autoboy-spec-tag">{product.category}</span>
                    </div>
                    
                    {/* Pricing */}
                    <div className="autoboy-deal-price">
                      <span className="autoboy-current-price">{product.price}</span>
                      {product.originalPrice && (
                        <>
                          <span className="autoboy-original-price">{product.originalPrice}</span>
                          {product.discount && (
                            <span className="autoboy-discount">Save {product.discount}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="autoboy-product-rating">
                      <div className="autoboy-stars">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`${i < Math.floor(product.rating) ? 'fas' : 'far'} fa-star autoboy-star ${i < Math.floor(product.rating) ? '' : 'empty'}`}
                          ></i>
                        ))}
                      </div>
                      <span className="autoboy-rating-count">({product.reviews} reviews)</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="autoboy-product-actions">
                      <button className="autoboy-action-btn autoboy-btn-primary">
                        <i className="fas fa-shopping-cart"></i>
                        Add to Cart
                      </button>
                      <button className="autoboy-action-btn autoboy-btn-secondary">
                        <i className="fas fa-eye"></i>
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* View All Products Button */}
          <motion.div 
            className="autoboy-view-all-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.a 
              href="/shop" 
              className="autoboy-view-all-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>View All Products</span>
              <i className="fas fa-arrow-right"></i>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="newsletter-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="newsletter-content"
          >
            <div className="newsletter-text">
              <h2 className="newsletter-title">
                <i className="fas fa-envelope newsletter-icon"></i>
                Get Exclusive Deals & Updates
              </h2>
              <p className="newsletter-subtitle">
                Subscribe to our newsletter and get 10% off your first order plus early access to flash sales!
              </p>
              <div className="newsletter-benefits">
                <span className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  Exclusive discount codes
                </span>
                <span className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  Early access to sales
                </span>
                <span className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  Latest tech news
                </span>
              </div>
            </div>

            <form onSubmit={handleNewsletterSignup} className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="newsletter-btn"
                >
                  <span>Get 10% Off</span>
                  <i className="fas fa-paper-plane"></i>
                </motion.button>
              </div>
              <p className="newsletter-privacy">
                <i className="fas fa-lock"></i>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Company Credibility Section */}
      <section className="credibility-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="credibility-content"
          >
            <h2 className="credibility-title">Why Choose Autoboy?</h2>
            <div className="credibility-grid">
              <div className="credibility-item">
                <div className="credibility-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>100% Authentic</h3>
                <p>All products are genuine and come with manufacturer warranty</p>
              </div>
              <div className="credibility-item">
                <div className="credibility-icon">
                  <i className="fas fa-truck-fast"></i>
                </div>
                <h3>Fast Delivery</h3>
                <p>Same-day delivery in Lagos, nationwide shipping available</p>
              </div>
              <div className="credibility-item">
                <div className="credibility-icon">
                  <i className="fas fa-headset"></i>
                </div>
                <h3>24/7 Support</h3>
                <p>Expert customer support team ready to help anytime</p>
              </div>
              <div className="credibility-item">
                <div className="credibility-icon">
                  <i className="fas fa-medal"></i>
                </div>
                <h3>5+ Years Experience</h3>
                <p>Trusted by thousands of customers since 2019</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment & Shipping Assurance */}
      <section className="assurance-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="assurance-content"
          >
            <div className="assurance-grid">
              <div className="assurance-column">
                <h3 className="assurance-title">
                  <i className="fas fa-credit-card"></i>
                  Secure Payment
                </h3>
                <div className="payment-methods">
                  <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" />
                  <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" />
                  <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" />
                  <img src="https://img.icons8.com/color/48/bank-cards.png" alt="Bank Transfer" />
                </div>
                <p>Your payment information is encrypted and secure</p>
              </div>

              <div className="assurance-column">
                <h3 className="assurance-title">
                  <i className="fas fa-shipping-fast"></i>
                  Shipping Options
                </h3>
                <div className="shipping-options">
                  <div className="shipping-option">
                    <i className="fas fa-bolt"></i>
                    <span>Same-day delivery (Lagos)</span>
                  </div>
                  <div className="shipping-option">
                    <i className="fas fa-truck"></i>
                    <span>2-3 days nationwide</span>
                  </div>
                  <div className="shipping-option">
                    <i className="fas fa-store"></i>
                    <span>Pickup available</span>
                  </div>
                </div>
              </div>

              <div className="assurance-column">
                <h3 className="assurance-title">
                  <i className="fas fa-undo-alt"></i>
                  Easy Returns
                </h3>
                <div className="return-policy">
                  <div className="return-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>30-day return policy</span>
                  </div>
                  <div className="return-item">
                    <i className="fas fa-exchange-alt"></i>
                    <span>Free exchanges</span>
                  </div>
                  <div className="return-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>Full refund guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;