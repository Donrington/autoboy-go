import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    let pulseTimeout;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;
      
      setScrollProgress(progress);
      
      const shouldShow = scrolled > 300;
      
      if (shouldShow && !isVisible) {
        setIsVisible(true);
        setShouldPulse(false);
        
        // Add pulse effect after 5 seconds of being visible
        pulseTimeout = setTimeout(() => {
          setShouldPulse(true);
        }, 5000);
        
      } else if (!shouldShow && isVisible) {
        setIsVisible(false);
        setShouldPulse(false);
        clearTimeout(pulseTimeout);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(pulseTimeout);
    };
  }, [isVisible]);

  const scrollToTop = () => {
    setShouldPulse(false);
    
    const scrollStep = -window.scrollY / (500 / 15);
    
    const smoothScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
        requestAnimationFrame(smoothScroll);
      }
    };
    
    smoothScroll();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  const circumference = 2 * Math.PI * 26; // radius is 26
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={`back-to-top ${shouldPulse ? 'pulse' : ''}`}
          onClick={scrollToTop}
          onKeyDown={handleKeyDown}
          aria-label="Back to top"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            boxShadow: shouldPulse 
              ? '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.4)'
              : '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.7), 0 0 50px rgba(34, 197, 94, 0.5)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 20 
          }}
        >
          <svg className="progress-ring" viewBox="0 0 56 56">
            <circle 
              className="progress-ring__circle" 
              cx="28" 
              cy="28" 
              r="26"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.1s ease-out'
              }}
            />
          </svg>
          <motion.i 
            className="fas fa-arrow-up"
            animate={{ 
              y: shouldPulse ? [-2, 2, -2] : 0 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: shouldPulse ? Infinity : 0,
              ease: 'easeInOut'
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;