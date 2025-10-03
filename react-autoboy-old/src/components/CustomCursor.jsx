import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const cursorTrailRef = useRef(null);
  const cursorGlowRef = useRef(null);

  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorOutline = cursorOutlineRef.current;
    const cursorTrail = cursorTrailRef.current;
    const cursorGlow = cursorGlowRef.current;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }
      
      if (cursorGlow) {
        cursorGlow.style.left = `${mouseX}px`;
        cursorGlow.style.top = `${mouseY}px`;
      }
    };

    const animateOutline = () => {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      
      if (cursorOutline) {
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
      }
      
      requestAnimationFrame(animateOutline);
    };

    const animateTrail = () => {
      trailX += (mouseX - trailX) * 0.08;
      trailY += (mouseY - trailY) * 0.08;
      
      if (cursorTrail) {
        cursorTrail.style.left = `${trailX}px`;
        cursorTrail.style.top = `${trailY}px`;
      }
      
      requestAnimationFrame(animateTrail);
    };

    const handleMouseEnter = () => {
      if (cursorDot) cursorDot.style.opacity = '1';
      if (cursorOutline) cursorOutline.style.opacity = '1';
      if (cursorTrail) cursorTrail.style.opacity = '1';
      if (cursorGlow) cursorGlow.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorOutline) cursorOutline.style.opacity = '0';
      if (cursorTrail) cursorTrail.style.opacity = '0';
      if (cursorGlow) cursorGlow.style.opacity = '0';
    };

    const handleMouseDown = () => {
      if (cursorDot) cursorDot.style.transform = 'translate(-50%, -50%) scale(0.8)';
      if (cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.3)';
    };

    const handleMouseUp = () => {
      if (cursorDot) cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      if (cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    // Start animations
    animateOutline();
    animateTrail();

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-link, .category-card, .ab-product-card');
    
    const handleHoverStart = () => {
      if (cursorDot) {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorDot.style.background = 'var(--primary-green)';
      }
      if (cursorOutline) {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(2)';
        cursorOutline.style.border = '2px solid var(--primary-green)';
      }
    };

    const handleHoverEnd = () => {
      if (cursorDot) {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorDot.style.background = 'var(--primary-green)';
      }
      if (cursorOutline) {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.border = '2px solid var(--primary-green-light)';
      }
    };

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={cursorDotRef}></div>
      <div className="cursor-outline" ref={cursorOutlineRef}></div>
      <div className="cursor-trail" ref={cursorTrailRef}></div>
      <div className="cursor-glow" ref={cursorGlowRef}></div>
    </>
  );
};

export default CustomCursor;