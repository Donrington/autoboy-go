import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const HeroSection = () => {
  const [currentBg, setCurrentBg] = useState(0);
  const bubblesRef = useRef(null);
  
  const backgrounds = [
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1920&h=1080&fit=crop&q=90',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1920&h=1080&fit=crop&q=90',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=1080&fit=crop&q=90',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&h=1080&fit=crop&q=90'
  ];

  // Background slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Create floating bubbles animation
  useEffect(() => {
    const createBubbles = () => {
      const container = bubblesRef.current;
      if (!container) return;

      // Clear existing bubbles
      container.innerHTML = '';

      // Create 20 bubbles
      for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        
        // Random size and position
        const size = Math.random() * 60 + 20;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        
        bubble.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${Math.random() * 100}%;
          animation-delay: ${delay}s;
          animation-duration: ${duration}s;
        `;
        
        container.appendChild(bubble);
      }
    };

    createBubbles();
    
    // Recreate bubbles periodically for variety
    const bubbleInterval = setInterval(createBubbles, 30000);
    
    return () => clearInterval(bubbleInterval);
  }, []);

  return (
    <section className="hero-section">
      {/* Background Container */}
      <div className="background-container">
        <div className="background-layer">
          {backgrounds.map((bg, index) => (
            <div
              key={index}
              className={`background-image bg-${index + 1} ${index === currentBg ? 'active' : ''}`}
              style={{ backgroundImage: `url(${bg})` }}
              data-index={index}
            />
          ))}
        </div>
        <div className="gradient-overlay"></div>
        <div className="noise-overlay"></div>
      </div>

      {/* Floating Bubbles */}
      <div className="floating-bubbles" ref={bubblesRef}></div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-text">
            <motion.h2 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Welcome to the Future
            </motion.h2>
            
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Discover the Future of
              <span className="gradient-text"> Gadget on Autoboy</span>
            </motion.h1>
            
            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Explore our curated selection of the latest gadgets and unbeatable deals. Join a community where buying, selling, and swapping electronics is seamless and secure.
            </motion.p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <a href="/login" className="btn btn-primary">Shop Now</a>
              <a href="/login" className="btn btn-secondary">Sign Up</a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;