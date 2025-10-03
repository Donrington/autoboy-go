import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './assets/css/styles.css';

// Initialize AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    once: true,
    duration: 1000,
    easing: 'ease-out-cubic',
    offset: 50,
    disable: 'phone' // Disable on mobile for better performance
  });
});

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);