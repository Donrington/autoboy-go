import { useState, useEffect } from 'react';
import './BackToTop.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxHeight) * 100;

      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Check on mount

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const circumference = 2 * Math.PI * 26;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      className={`back-to-top-btn ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg className="progress-ring" viewBox="0 0 56 56">
        <circle
          className="progress-ring-bg"
          cx="28"
          cy="28"
          r="26"
        />
        <circle
          className="progress-ring-circle"
          cx="28"
          cy="28"
          r="26"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }}
        />
      </svg>
      <i className="fas fa-arrow-up"></i>
    </button>
  );
};

export default BackToTop;