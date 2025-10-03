import { useState } from 'react';
import { motion } from 'framer-motion';

const TrendingSection = () => {
  const [favorites, setFavorites] = useState(new Set([2])); // Pre-select third item as favorite

  const toggleFavorite = (index) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  const products = [
    {
      image: 'https://images.unsplash.com/photo-1664114780064-41d0dd873e92?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fGlwaG9uZSUyMDE2JTIwcHJvJTIwbWF4fGVufDB8fDB8fHww',
      name: 'iPhone 16 Pro Max',
      description: 'The ultimate iPhone experience with titanium design and advanced pro camera system.',
      badge: 'trending',
      badgeText: 'Trending'
    },
    {
      image: 'https://cdn.cosmos.so/424ab841-a146-477d-9db4-a3150b28a9c2?format=jpeg',
      name: 'iPhone 16',
      description: 'Powerful A18 chip with incredible performance and all-day battery life.',
      badge: 'new',
      badgeText: 'New'
    },
    {
      image: 'https://cdn.cosmos.so/f1c10496-1c97-4328-b4c9-51e3ea29d77b?format=jpeg',
      name: 'iPhone 16 Pro',
      description: 'Pro performance with titanium build and advanced computational photography.',
      badge: 'featured',
      badgeText: 'UK Used'
    },
    {
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=600&fit=crop&auto=format',
      name: 'Galaxy S21',
      description: 'Revolutionary foldable design that transforms your mobile experience.',
      badge: 'trending',
      badgeText: 'Hot'
    },
    {
      image: 'https://www.pointekonline.com/wp-content/uploads/2025/01/sms938_galaxys25ultra_front_titaniumblack_5506351.png',
      name: 'Galaxy S25 Ultra',
      description: 'Ultimate productivity powerhouse with S Pen and professional cameras.',
      badge: 'new',
      badgeText: 'Latest'
    },
    {
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=600&fit=crop&auto=format',
      name: 'MacBook Pro 2024',
      description: 'Revolutionary M4 chip delivers incredible performance for professionals.',
      badge: 'featured',
      badgeText: 'US Used'
    },
    {
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&h=600&fit=crop&auto=format',
      name: 'Gaming PC Ultra',
      description: 'Ultimate gaming machine with cutting-edge graphics and performance.',
      badge: 'trending',
      badgeText: 'Grade A'
    },
    {
      image: 'https://images.unsplash.com/photo-1661340272675-f6829791246e?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'iPad Pro 2024',
      description: 'Creative powerhouse with M4 chip and stunning Liquid Retina display.',
      badge: 'new',
      badgeText: 'Grade B'
    }
  ];

  return (
    <section className="ab-trending-section">
      {/* Animated Background */}
      <div className="ab-bg-animation">
        <div className="ab-floating-orb ab-orb-1"></div>
        <div className="ab-floating-orb ab-orb-2"></div>
        <div className="ab-floating-orb ab-orb-3"></div>
      </div>

      <div className="ab-container">
        {/* Section Header */}
        <motion.div 
          className="ab-section-header ab-reveal"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="ab-section-title">Trending Collection</h2>
          <a href="#" className="ab-more-btn">
            <span>Explore More</span>
            <i className="fas fa-arrow-right"></i>
          </a>
        </motion.div>

        {/* Products Grid */}
        <div className="ab-products-grid">
          {products.map((product, index) => (
            <motion.div
              key={index}
              className="ab-product-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="ab-product-image" 
              />
              <div className={`ab-status-badge ${product.badge}`}>
                {product.badgeText}
              </div>
              <motion.button 
                className={`ab-favorite-btn ${favorites.has(index) ? 'active' : ''}`}
                onClick={() => toggleFavorite(index)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <i className="fas fa-heart"></i>
              </motion.button>
              <motion.div 
                className="ab-product-overlay"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="ab-product-name">{product.name}</h3>
                <p className="ab-product-description">{product.description}</p>
                <motion.button 
                  className="ab-explore-btn"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span>Explore</span>
                  <i className="fas fa-arrow-right"></i>
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;