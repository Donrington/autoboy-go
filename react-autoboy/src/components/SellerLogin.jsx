import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSun, faMoon, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

// Import logo
import autoboyLogo from '../assets/autoboy_logo2.png';

// Import CSS files
import '../assets/sellersignup.css';
import '../assets/styles.css';
import './SellerSignup.css';

const SellerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemDark);
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Errors state
  const [errors, setErrors] = useState({});

  // Handle dark mode
  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      // Check if user is a seller
      const userData = response?.data?.user || response?.user;
      const userType = userData?.user_type || userData?.type;

      if (userType !== 'seller') {
        setToast({
          message: 'This account is not registered as a seller. Please use buyer login.',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }

      // Show success toast
      setToast({
        message: '🎉 Login successful! Welcome back!',
        type: 'success'
      });

      // Redirect to homepage after successful login
      setTimeout(() => {
        navigate('/homepage');
      }, 1500);

    } catch (error) {
      console.error('Seller login error:', error);
      setToast({
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={`seller-signup-page ${isDarkMode ? 'dark-mode' : ''}`} style={{paddingTop: '0px'}}>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="seller-auth-container">
        {/* Left Visual Side */}
        <div className="seller-auth-visual">
          <div className="visual-floating-elements">
            <div className="visual-element"></div>
            <div className="visual-element"></div>
          </div>
          <div className="visual-3d-content">
            <div className="visual-3d-character">
              <div className="visual-3d-phone">
                <div className="phone-screen">
                  <div className="screen-content">
                    <div className="screen-header">
                      <div className="screen-time">
                        <i className="fas fa-store"></i> Seller Portal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Forms Side */}
        <div className="seller-auth-forms">
          <div className="seller-form-card">
            {/* Logo */}
            <div className="seller-form-logo">
              <div className="logocon">
                <a href="/homepage" className="logosign">
                  <img src={autoboyLogo} alt="Autoboy Logo" />
                </a>
              </div>
            </div>

            <h3 className="seller-form-title">Seller Login</h3>
            <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
              Welcome back! Login to manage your store
            </p>

            {/* Login Form */}
            <form className="seller-form-step active" onSubmit={handleSubmit}>
              <div className="seller-form-group">
                <label className="seller-form-label">Email Address</label>
                <input
                  type="email"
                  className="seller-form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <span className="seller-error-message">{errors.email}</span>}
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Password</label>
                <div className="seller-password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="seller-form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="seller-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.password && <span className="seller-error-message">{errors.password}</span>}
              </div>

              <div className="seller-checkbox-group seller-form-group" style={{ marginBottom: '1rem' }}>
                <label className="seller-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="seller-form-button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <div className="seller-form-footer">
                Don't have a seller account? <a href="/seller-signup">Sign Up</a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="theme-toggle" onClick={toggleTheme}>
        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
      </div>
    </div>
  );
};

export default SellerLogin;
