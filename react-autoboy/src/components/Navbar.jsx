import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';

const Navbar = ({ darkMode }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    const dashboardUrl = getDashboardUrl();
    navigate(dashboardUrl);
  };

  // Get dashboard URL based on user type
  const getDashboardUrl = () => {
    if (!isAuthenticated || !user) return '/auth';

    const userType = user.user_type || user.type || 'buyer';
    switch (userType.toLowerCase()) {
      case 'seller':
        return '/seller-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'buyer':
      default:
        return '/buyer-dashboard';
    }
  };

  // Get display name for navbar
  const getDisplayName = () => {
    if (!isAuthenticated || !user) return 'Account';

    const firstName = user.first_name || user.firstName || user.username || 'User';
    return `Hi, ${firstName}`;
  };


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close dropdown when mobile menu closes
    if (mobileMenuOpen) {
      setMobileDropdownOpen(false);
    }
  };

  const toggleMobileDropdown = () => {
    setMobileDropdownOpen(!mobileDropdownOpen);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-container">
          {/* Logo */}
          <a href="/" className="logo">
            <img src={darkMode ? darkLogo : lightLogo} alt="Autoboy Logo" />
          </a>
          
          {/* Navigation Center (Desktop) */}
          <div className="nav-center">
            <a href="/become-seller" className="become-seller-btn">
              <i className="fas fa-store"></i>
              <span>Become a seller</span>
            </a>
            
            {/* Shop Dropdown */}
            <div className="nav-dropdown">
              <a href="/shop" className="nav-dropdown-trigger">
                <i className="fas fa-shopping-bag"></i>
                <span>Shop</span>
                <i className="fas fa-chevron-down dropdown-arrow"></i>
              </a>
              <div className="nav-dropdown-menu">
                <div className="dropdown-section">
                  <h4 className="dropdown-section-title">Categories</h4>
                  <div className="dropdown-links">
                    <a href="/shop?category=brand-new" className="dropdown-link">
                      <i className="fas fa-tag"></i>
                      <span>Brand New</span>
                    </a>
                    <a href="/shop?category=uk-used" className="dropdown-link">
                      <i className="fas fa-globe"></i>
                      <span>UK Used</span>
                    </a>
                    <a href="/shop?category=good-deal" className="dropdown-link">
                      <i className="fas fa-fire"></i>
                      <span>Good Deal</span>
                    </a>
                    <a href="/shop?category=nigerian-used" className="dropdown-link">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>Nigerian Used</span>
                    </a>
                    <a href="/shop?category=swap-deal" className="dropdown-link">
                      <i className="fas fa-exchange-alt"></i>
                      <span>Swap Deal</span>
                    </a>
                    <a href="/shop?category=for-sale" className="dropdown-link">
                      <i className="fas fa-dollar-sign"></i>
                      <span>For Sale</span>
                    </a>
                    <a href="/shop?category=want-to-buy" className="dropdown-link">
                      <i className="fas fa-search"></i>
                      <span>Want to Buy</span>
                    </a>
                    <a href="/shop?category=random-items" className="dropdown-link">
                      <i className="fas fa-random"></i>
                      <span>Random Items</span>
                    </a>
                  </div>
                </div>
                <div className="dropdown-section">
                  <h4 className="dropdown-section-title">Device Types</h4>
                  <div className="dropdown-links">
                    <a href="/shop?type=phones" className="dropdown-link">
                      <i className="fas fa-mobile-alt"></i>
                      <span>Smartphones</span>
                    </a>
                    <a href="/shop?type=laptops" className="dropdown-link">
                      <i className="fas fa-laptop"></i>
                      <span>Laptops</span>
                    </a>
                    <a href="/shop?type=tablets" className="dropdown-link">
                      <i className="fas fa-tablet-alt"></i>
                      <span>Tablets</span>
                    </a>
                    <a href="/shop?type=audio" className="dropdown-link">
                      <i className="fas fa-volume-up"></i>
                      <span>Audio Equipment</span>
                    </a>
                    <a href="/shop?type=headphones" className="dropdown-link">
                      <i className="fas fa-headphones"></i>
                      <span>Headphones</span>
                    </a>
                    <a href="/shop?type=gaming" className="dropdown-link">
                      <i className="fas fa-gamepad"></i>
                      <span>Video Game Consoles</span>
                    </a>
                    <a href="/shop?type=accessories" className="dropdown-link">
                      <i className="fas fa-plug"></i>
                      <span>Accessories</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="search-container">
              <div className="search-wrapper">
                <input type="text" className="search-input" placeholder="Search products, brands and categories" />
                <button className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Navigation Right */}
          <div className="nav-right">
            <a
              href={getDashboardUrl()}
              className="nav-link"
              onClick={handleDashboardClick}
            >
              <i className="fas fa-user-circle"></i>
              <span>{getDisplayName()}</span>
            </a>
            <a href="/cart" className="nav-link">
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
            </a>
            <a href="/help" className="nav-link">
              <i className="fas fa-headphones"></i>
              <span>Help</span>
            </a>

            {/* Logout Button - Only show when logged in */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontSize: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
              <div className="mobile-menu-header">
                <button className="mobile-close-btn" onClick={toggleMobileMenu}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="mobile-search search-container">
                <div className="search-wrapper">
                  <input type="text" className="search-input" placeholder="Search products..." />
                  <button className="search-btn">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
              
              <div className="mobile-nav-links">
                <a href="/become-seller" className="mobile-nav-link">
                  <i className="fas fa-store"></i>
                  Become a seller
                </a>
                
                <div className={`mobile-nav-dropdown ${mobileDropdownOpen ? 'active' : ''}`}>
                  <div className="mobile-nav-link mobile-dropdown-trigger" onClick={toggleMobileDropdown}>
                    <i className="fas fa-shopping-bag"></i>
                    Shop
                    <i className="fas fa-chevron-down mobile-dropdown-arrow"></i>
                  </div>
                  <div className="mobile-dropdown-menu">
                    <div className="mobile-dropdown-section">
                      <h5>Categories</h5>
                      <a href="/shop?category=brand-new" className="mobile-dropdown-link">Brand New</a>
                      <a href="/shop?category=uk-used" className="mobile-dropdown-link">UK Used</a>
                      <a href="/shop?category=good-deal" className="mobile-dropdown-link">Good Deal</a>
                      <a href="/shop?category=nigerian-used" className="mobile-dropdown-link">Nigerian Used</a>
                      <a href="/shop?category=swap-deal" className="mobile-dropdown-link">Swap Deal</a>
                      <a href="/shop?category=for-sale" className="mobile-dropdown-link">For Sale</a>
                      <a href="/shop?category=want-to-buy" className="mobile-dropdown-link">Want to Buy</a>
                      <a href="/shop?category=random-items" className="mobile-dropdown-link">Random Items</a>
                    </div>
                    <div className="mobile-dropdown-section">
                      <h5>Device Types</h5>
                      <a href="/shop?type=phones" className="mobile-dropdown-link">Smartphones</a>
                      <a href="/shop?type=laptops" className="mobile-dropdown-link">Laptops</a>
                      <a href="/shop?type=tablets" className="mobile-dropdown-link">Tablets</a>
                      <a href="/shop?type=audio" className="mobile-dropdown-link">Audio Equipment</a>
                      <a href="/shop?type=headphones" className="mobile-dropdown-link">Headphones</a>
                      <a href="/shop?type=gaming" className="mobile-dropdown-link">Video Game Consoles</a>
                      <a href="/shop?type=accessories" className="mobile-dropdown-link">Accessories</a>
                    </div>
                  </div>
                </div>
                
                <a
                  href={getDashboardUrl()}
                  className="mobile-nav-link"
                  onClick={handleDashboardClick}
                >
                  <i className="fas fa-user-circle"></i>
                  {getDisplayName()}
                </a>
                <a href="/cart" className="mobile-nav-link">
                  <i className="fas fa-shopping-cart"></i>
                  Cart
                </a>
                <a href="/wishlist" className="mobile-nav-link">
                  <i className="fas fa-heart"></i>
                  Wishlist
                </a>
                <a href="/support" className="mobile-nav-link">
                  <i className="fas fa-headset"></i>
                  Support
                </a>

                {/* Logout Button - Only show when logged in */}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="mobile-nav-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                      fontSize: 'inherit',
                      width: '100%',
                      textAlign: 'left',
                      padding: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                )}
              </div>
          </div>

          <div
            className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          />
        </>
      )}
    </>
  );
};

export default Navbar;