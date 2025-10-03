import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import TrendingSection from './components/TrendingSection';
import Homepage from './components/Homepage';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import CustomCursor from './components/CustomCursor';
import BackToTop from './components/BackToTop';
import LoginSignup from './components/LoginSignup';
import ProductDetails from './components/ProductDetails';
import BecomeSeller from './components/BecomeSeller';
import SellerSignup from './components/SellerSignup';
import SellerDashboard from './components/SellerDashboard';
import PremiumSellerDashboard from './components/PremiumSellerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import PremiumBuyerDashboard from './components/PremiumBuyerDashboard';
import AdminDashboard from './components/AdminDashboard';


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
        if (e.matches) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    
    if (newTheme) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  // Landing Page Layout (original design)
  const LandingPage = () => (
    <>
      <HeroSection />
      <CategoriesSection />
      <TrendingSection />
    </>
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication routes without navbar/footer */}
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/register" element={<LoginSignup />} />
          <Route path="/auth" element={<LoginSignup />} />

          {/* Dashboard routes without navbar/footer */}
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/premium-seller-dashboard" element={<PremiumSellerDashboard />} />
          <Route path="/premium-buyer-dashboard" element={<PremiumBuyerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* Routes with navbar and footer */}
          <Route path="/*" element={
            <>
              <CustomCursor />
              <Navbar darkMode={darkMode} />
              <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
              
              <main>
                <Routes>
                  {/* Landing page with original design */}
                  <Route path="/" element={<LandingPage />} />
                  
                  {/* Homepage with products showcase */}
                  <Route path="/homepage" element={<Homepage />} />
                  
                  {/* Shop and other routes */}
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/product-details" element={<ProductDetails />} />
                  <Route path="/become-seller" element={<BecomeSeller />} />
                  <Route path="/seller-signup" element={<SellerSignup />} />
                  <Route path="/seller-signin" element={<div>Seller Sign In - Coming Soon</div>} />
                  <Route path="/category/:id" element={<div>Category Page - Coming Soon</div>} />
                  <Route path="/profile" element={<div>Profile Page - Coming Soon</div>} />
                  
                  
                  {/* 404 Page */}
                  <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
              </main>
              
              <Footer />
              <BackToTop />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;