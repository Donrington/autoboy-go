import { useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const CategoriesSection = () => {
  useEffect(() => {
    // GSAP animations for category cards
    const cards = document.querySelectorAll('.category-card');
    
    cards.forEach(card => {
      const glow = card.querySelector('.card-glow');
      const iconBg = card.querySelector('.icon-bg');
      
      card.addEventListener('mouseenter', () => {
        if (glow && iconBg) {
          gsap.to(glow, {
            opacity: 1,
            scale: 1,
            duration: 0.3
          });
          
          gsap.to(iconBg, {
            scale: 1.2,
            rotation: 180,
            duration: 0.8,
            ease: 'power2.out'
          });
          
          gsap.to(card, {
            y: -10,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
      
      card.addEventListener('mouseleave', () => {
        if (glow && iconBg) {
          gsap.to(glow, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3
          });
          
          gsap.to(iconBg, {
            scale: 1,
            rotation: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
          
          gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  const categories = [
    {
      icon: 'fas fa-mobile-alt',
      title: 'Phones & Tablets',
      description: 'Discover the best phones, tablets, laptops, and accessories',
      detail: 'Find the perfect device that suits your needs and lifestyle.',
      stats: { products: '2.5K+', brands: '150+' },
      link: '/login'
    },
    {
      icon: 'fas fa-tablet-alt',
      title: 'Tablets & Accessories',
      description: 'Unlock amazing deals on the latest tablets and accessories',
      detail: 'Upgrade your tech with our wide selection of tablets and accessories.',
      stats: { products: '1.8K+', brands: '80+' },
      link: '/login',
      featured: true
    },
    {
      icon: 'fas fa-laptop',
      title: 'Laptops & Gaming',
      description: 'Get the best value with our laptops, consoles and electronics range',
      detail: 'Explore our laptops and consoles designed for performance, style, and affordability.',
      stats: { products: '3.2K+', brands: '200+' },
      link: '/login'
    }
  ];

  return (
    <section className="categories-section">
      {/* Animated Green Background */}
      <div className="animated-bg-container">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="noise-overlay"></div>
      </div>

      {/* Section Content */}
      <div className="container">
        {/* Section Header */}
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">
            <i className="fas fa-sparkles"></i>
            Discover More
          </span>
          <h2 className="section-title">
            <span className="title-line">Explore Our Top Categories for the</span>
            <span className="title-line highlight">Latest Gadgets and Electronics</span>
          </h2>
          <p className="section-subtitle">
            Curated collections of premium tech, handpicked for the modern digital lifestyle
          </p>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className={`category-card ${category.featured ? 'featured' : ''}`}
              data-aos="fade-up"
              data-aos-delay={100 + index * 100}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {category.featured && (
                <div className="featured-badge">Most Popular</div>
              )}
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="icon-wrapper">
                  <div className="icon-bg"></div>
                  <i className={category.icon}></i>
                </div>
                <h3 className="card-title">{category.title}</h3>
                <p className="card-description">{category.description}</p>
                <p className="card-detail">{category.detail}</p>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-number">{category.stats.products}</span>
                    <span className="stat-label">Products</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{category.stats.brands}</span>
                    <span className="stat-label">Brands</span>
                  </div>
                </div>
                <a href={category.link} className={`shop-btn ${category.featured ? 'primary' : ''}`}>
                  <span>Shop Now</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="cta-section" data-aos="fade-up" data-aos-delay="400">
          <div className="cta-content">
            <div className="cta-left">
              <h3 className="cta-title">
                <span className="text-gradient">Join Us for a Personalised</span>
                <span className="text-gradient">Experience</span>
              </h3>
              <p className="cta-description">
                Register or log in to unlock a tailored shopping experience and exclusive offers just for you.
              </p>
              <div className="cta-features">
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Exclusive member discounts</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Early access to new products</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Personalized recommendations</span>
                </div>
              </div>
              <div className="cta-buttons">
                <a href="/login" className="cta-btn primary">
                  <span>Sign Up</span>
                  <i className="fas fa-user-plus"></i>
                </a>
                <a href="/login" className="cta-btn secondary">
                  <span>Log In</span>
                  <i className="fas fa-sign-in-alt"></i>
                </a>
              </div>
            </div>
            <div className="cta-right">
              <div className="phone-showcase">
                <img 
                  src="data:image/svg+xml,%3Csvg width='400' height='500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='500' fill='transparent'/%3E%3C/svg%3E" 
                  alt="Phone showcase" 
                  className="phone-img" 
                />
                <div className="phone-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;