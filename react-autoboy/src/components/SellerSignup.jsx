import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faArrowLeft, faArrowRight, faEye, faEyeSlash,
  faSun, faMoon, faArrowUp, faClock, faBox, faShoppingBag, faPercentage
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Toast from './Toast';
import Alert from './Alert';

// Import logo
import autoboyLogo from '../assets/autoboy_logo2.png';

// Import CSS files
import '../assets/sellersignup.css';
import '../assets/styles.css';
import './SellerSignup.css';

const SellerSignup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [skipEmailVerification] = useState(true); // Skip email verification during signup
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && systemDark);
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [alert, setAlert] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    country: '',
    email: '',
    verificationCode: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    shopName: '',
    shopLocation: '',
    agreeToTerms: false
  });

  // Errors state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Utility functions
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Form handlers - memoized to prevent re-creation
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.country) newErrors.country = 'Please select a country';
        break;
      case 2:
        if (!formData.email) {
          newErrors.email = 'Please enter your email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        break;
      case 3:
        if (!formData.verificationCode) {
          newErrors.verificationCode = 'Please enter verification code';
        } else if (formData.verificationCode.length !== 6) {
          newErrors.verificationCode = 'Verification code must be 6 digits';
        }
        break;
      case 4:
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Please enter phone number';
        if (!formData.password) {
          newErrors.password = 'Please enter password';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      case 5:
        if (!formData.accountType) newErrors.accountType = 'Please select account type';
        if (!formData.shopName) newErrors.shopName = 'Please enter shop name';
        if (!formData.shopLocation) newErrors.shopLocation = 'Please enter shop location';
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Please agree to terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = async () => {
    if (validateStep(currentStep)) {
      if (skipEmailVerification && currentStep === 2) {
        // Skip steps 2 and 3 (email verification) - backend handles this after registration
        setCurrentStep(4); // Jump to password step
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (skipEmailVerification && currentStep === 4) {
        // Skip back over verification steps
        setCurrentStep(2);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (validateStep(5)) {
      setIsLoading(true);

      try {
        // Prepare registration data for backend
        const registrationData = {
          email: formData.email,
          password: formData.password,
          first_name: formData.shopName.split(' ')[0] || formData.shopName,
          last_name: formData.shopName.split(' ').slice(1).join(' ') || formData.shopName,
          username: formData.email.split('@')[0],
          phone: `+234${formData.phoneNumber}`,
          user_type: 'seller', // Set as seller
          accept_terms: formData.agreeToTerms,
          // Additional seller-specific data (if backend supports)
          shop_name: formData.shopName,
          shop_location: formData.shopLocation,
          account_type: formData.accountType
        };

        console.log('Seller registration data:', registrationData);

        await register(registrationData);

        // Show success toast
        setToast({
          message: '🎉 Seller account created successfully! Please check your email to verify your account.',
          type: 'success'
        });

        // Redirect to homepage after successful registration
        setTimeout(() => {
          navigate('/homepage');
        }, 2000);

      } catch (error) {
        console.error('Seller registration error:', error);
        setToast({
          message: error.message || 'Registration failed. Please try again.',
          type: 'error'
        });
        setIsLoading(false);
      }
    }
  };

  const resendVerificationCode = async () => {
    setIsLoading(true);
    try {
      await authAPI.resendEmailVerification(formData.email);
      setAlert({
        message: `Verification code resent to ${formData.email}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      setAlert({
        message: error.message || 'Failed to resend verification code',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step components
  const Step1 = () => (
    <form className="seller-form-step active">
      <div className="seller-form-group">
        <label className="seller-form-label">Select your country</label>
        <select
          className="seller-form-select"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
        >
          <option value="">Select your country</option>
          <option value="NG">Nigeria</option>
          <option value="GH">Ghana</option>
          <option value="KE">Kenya</option>
          <option value="ZA">South Africa</option>
          <option value="EG">Egypt</option>
        </select>
        {errors.country && <span className="seller-error-message">{errors.country}</span>}
      </div>
    </form>
  );

  const Step2 = useMemo(() => (
    <form className="seller-form-step active">
      <div className="seller-form-group">
        <label className="seller-form-label">Enter your email</label>
        <input
          type="email"
          className="seller-form-input"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          autoComplete="email"
        />
        {errors.email && <span className="seller-error-message">{errors.email}</span>}
      </div>
    </form>
  ), [formData.email, errors.email, handleInputChange]);

  const Step3 = () => (
    <form className="seller-form-step active">
      <div className="seller-form-group">
        <label className="seller-form-label">
          Verification code sent to {formData.email}
        </label>
        <input
          type="text"
          className="seller-verification-input seller-form-input"
          placeholder="Enter verification code"
          maxLength="6"
          value={formData.verificationCode}
          onChange={(e) => handleInputChange('verificationCode', e.target.value)}
        />
        {errors.verificationCode && <span className="seller-error-message">{errors.verificationCode}</span>}
        <button
          type="button"
          className="seller-resend-button"
          onClick={resendVerificationCode}
          disabled={isLoading}
        >
          Resend Code
        </button>
      </div>
    </form>
  );

  const Step4 = useMemo(() => (
    <form className="seller-form-step active">
      <div className="seller-phone-group seller-form-group">
        <label className="seller-form-label">Phone Number</label>
        <div className="seller-phone-input">
          <span className="seller-country-code">+234</span>
          <input
            type="tel"
            className="seller-form-input"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          />
        </div>
        {errors.phoneNumber && <span className="seller-error-message">{errors.phoneNumber}</span>}
      </div>

      <div className="seller-form-group">
        <label className="seller-form-label">Password</label>
        <div className="seller-password-input">
          <input
            type={showPassword ? "text" : "password"}
            className="seller-form-input"
            placeholder="Password"
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

      <div className="seller-form-group">
        <label className="seller-form-label">Confirm Password</label>
        <div className="seller-password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="seller-form-input"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          />
          <button
            type="button"
            className="seller-password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        {errors.confirmPassword && <span className="seller-error-message">{errors.confirmPassword}</span>}
      </div>

      <div className="seller-password-hint">
        <p>Password must contain:</p>
        <ul>
          <li>At least 8 characters</li>
          <li>Capital letter (A-Z)</li>
          <li>Lowercase letter (a-z)</li>
          <li>Number (0-9)</li>
          <li>Special character (!@#$%^&*)</li>
        </ul>
      </div>
    </form>
  ), [formData.phoneNumber, formData.password, formData.confirmPassword, errors.phoneNumber, errors.password, errors.confirmPassword, showPassword, showConfirmPassword, handleInputChange]);

  const Step5 = useMemo(() => (
    <form className="seller-form-step active">
      <div className="seller-radio-group seller-form-group">
        <label className="seller-form-label">Account Type</label>
        <div className="seller-radio-options">
          <label className="seller-radio-option">
            <input
              type="radio"
              name="accountType"
              value="business"
              checked={formData.accountType === 'business'}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
            />
            <span>Business</span>
          </label>
          <label className="seller-radio-option">
            <input
              type="radio"
              name="accountType"
              value="individual"
              checked={formData.accountType === 'individual'}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
            />
            <span>Individual</span>
          </label>
        </div>
        {errors.accountType && <span className="seller-error-message">{errors.accountType}</span>}
      </div>

      <div className="seller-form-group">
        <label className="seller-form-label">Shop Name</label>
        <input
          type="text"
          className="seller-form-input"
          placeholder="Enter your shop name"
          value={formData.shopName}
          onChange={(e) => handleInputChange('shopName', e.target.value)}
        />
        {errors.shopName && <span className="seller-error-message">{errors.shopName}</span>}
      </div>

      <div className="seller-form-group">
        <label className="seller-form-label">Shop Location</label>
        <input
          type="text"
          className="seller-form-input"
          placeholder="Enter your shop location"
          value={formData.shopLocation}
          onChange={(e) => handleInputChange('shopLocation', e.target.value)}
        />
        {errors.shopLocation && <span className="seller-error-message">{errors.shopLocation}</span>}
      </div>

      <div className="seller-checkbox-group seller-form-group">
        <label className="seller-checkbox-option">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
          />
          <span>I agree to the Terms and Conditions and Privacy Policy of Autoboy marketplace</span>
        </label>
        {errors.agreeToTerms && <span className="seller-error-message">{errors.agreeToTerms}</span>}
      </div>
    </form>
  ), [formData.accountType, formData.shopName, formData.shopLocation, formData.agreeToTerms, errors.accountType, errors.shopName, errors.shopLocation, errors.agreeToTerms, handleInputChange]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return Step2;
      case 3: return <Step3 />;
      case 4: return Step4;
      case 5: return Step5;
      default: return <Step1 />;
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

      {/* Alert Notification */}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
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
                        <FontAwesomeIcon icon={faClock} /> 08:30
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="visual-products">
              <div className="product-box">
                <FontAwesomeIcon icon={faBox} style={{color: 'white', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}} />
              </div>
              <div className="product-box">
                <FontAwesomeIcon icon={faShoppingBag} style={{color: 'white', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}} />
              </div>
              <div className="product-box">
                <FontAwesomeIcon icon={faPercentage} style={{color: 'white', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Forms Side */}
        <div className="seller-auth-forms">
          <div className="seller-form-card">
            {/* Progress Bar */}
            <div className="seller-progress-bar">
              <div className="seller-progress-fill" style={{width: `${skipEmailVerification ?
                (currentStep === 1 ? 33.33 : currentStep === 2 ? 66.66 : currentStep === 4 ? 66.66 : 100) :
                (currentStep / 5) * 100}%`}}></div>
            </div>

            {/* Logo */}
            <div className="seller-form-logo">
              <div className="logocon">
                <a href="/homepage" className="logosign">
                  <img src={autoboyLogo} alt="Autoboy Logo" />
                </a>
              </div>
            </div>

            <h3 className="seller-form-title">sell on Autoboy</h3>

            {/* Render Current Step */}
            {renderStep()}

            {/* Single Navigation Button - matching original */}
            {currentStep < 5 ? (
              <button
                type="button"
                className="seller-form-button"
                onClick={nextStep}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Loading...'
                ) : (
                  currentStep === 2 ? 'Send Code' : currentStep === 3 ? 'Verify' : 'Next'
                )}
              </button>
            ) : (
              <button
                type="button"
                className="seller-form-button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            )}

            <div className="seller-form-footer">
              Already have an account? <a href="/seller-signin">Sign In</a>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="theme-toggle" onClick={toggleTheme}>
        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop}>
          <svg className="progress-ring" viewBox="0 0 56 56">
            <circle className="progress-ring__circle" cx="28" cy="28" r="26"></circle>
          </svg>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </div>
  );
};

export default SellerSignup;