import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import styles from './LoginSignup.module.css';
import logo from '../assets/autoboy_logo3.png';
import { useAuth } from '../context/AuthContext';
import { useAsyncAPI } from '../hooks/useAPI';
import { authAPI } from '../services/api';
import Toast from './Toast';
import Navbar from './Navbar';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState({
    login: false,
    signup: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const particlesRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const formWrapperRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const cursorTrailRef = useRef(null);
  const cursorGlowRef = useRef(null);

  // Initialize particles and animations on mount
  useEffect(() => {
    // Create particles
    if (particlesRef.current) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = styles.particle;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        particlesRef.current.appendChild(particle);
      }
    }

    // GSAP Animations for orbs
    const orb1Animation = gsap.to(orb1Ref.current, {
      x: 100,
      y: -50,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    const orb2Animation = gsap.to(orb2Ref.current, {
      x: -100,
      y: 100,
      duration: 25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    const orb3Animation = gsap.to(orb3Ref.current, {
      scale: 1.2,
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Animate form on load
    gsap.from(formWrapperRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.2
    });

    // Cleanup function
    return () => {
      orb1Animation.kill();
      orb2Animation.kill();
      orb3Animation.kill();
    };
  }, []);

  // Mouse move parallax effect and custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (clientX - centerX) / 50;
      const moveY = (clientY - centerY) / 50;
      
      // Orb parallax effects
      gsap.to(orb1Ref.current, {
        x: 100 + moveX * 2,
        y: -50 + moveY * 2,
        duration: 1,
        ease: 'power2.out'
      });
      
      gsap.to(orb2Ref.current, {
        x: -100 - moveX,
        y: 100 - moveY,
        duration: 1,
        ease: 'power2.out'
      });
      
      gsap.to(orb3Ref.current, {
        x: moveX * 1.5,
        y: moveY * 1.5,
        duration: 1,
        ease: 'power2.out'
      });

      // Custom cursor movement
      if (cursorDotRef.current) {
        gsap.to(cursorDotRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.1,
          ease: 'power2.out'
        });
      }

      if (cursorOutlineRef.current) {
        gsap.to(cursorOutlineRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (cursorTrailRef.current) {
        gsap.to(cursorTrailRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.6,
          ease: 'power2.out'
        });
      }

      if (cursorGlowRef.current) {
        gsap.to(cursorGlowRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.8,
          ease: 'power2.out'
        });
      }
    };

    // Hover effects for interactive elements
    const handleMouseEnter = () => {
      if (cursorOutlineRef.current) {
        gsap.to(cursorOutlineRef.current, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseLeave = () => {
      if (cursorOutlineRef.current) {
        gsap.to(cursorOutlineRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    // Add hover events to interactive elements
    const interactiveElements = document.querySelectorAll('button, input, a, [data-cursor-hover]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Toggle password visibility
  const togglePassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate password
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Validate phone number (Nigerian format)
  const validatePhone = (phone) => {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone);
  };

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (isSignup) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!validatePhone(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid Nigerian phone number';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login } = useAuth();
  const { execute, loading: apiLoading, error: apiError } = useAsyncAPI();

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await execute(() => login({
        email: formData.email,
        password: formData.password
      }));

      // Get user data from response
      const userData = response?.data?.user || response?.user;
      const userType = userData?.user_type || userData?.type || 'buyer';

      // Show success toast
      setToast({
        message: '🎉 Login successful! Welcome back!',
        type: 'success'
      });

      // Redirect to homepage after a short delay to show the toast
      setTimeout(() => {
        navigate('/homepage');
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Login failed' });
    }
  };

  const { register } = useAuth();

  // Handle initial signup form submission (send verification email)
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Send email verification
      await authAPI.resendEmailVerification(formData.email);

      // Show verification screen
      setShowEmailVerification(true);

      setToast({
        message: `📧 Verification code sent to ${formData.email}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      setToast({
        message: error.message || 'Failed to send verification email',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email verification and complete registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: 'Please enter the 6-digit verification code' });
      return;
    }

    setIsLoading(true);
    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      // Format phone number to ensure it has +234 prefix
      let formattedPhone = formData.phoneNumber.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+234' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+234' + formattedPhone;
      }

      const registrationData = {
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName,
        username: formData.email.split('@')[0],
        phone: formattedPhone,
        user_type: 'buyer',
        accept_terms: true,
        verification_code: verificationCode
      };

      console.log('Registration data:', registrationData);

      const response = await execute(() => register(registrationData));

      // Show success toast
      setToast({
        message: '🎉 Account created successfully! Welcome to AutoBoy!',
        type: 'success'
      });

      // Redirect to homepage after a short delay
      setTimeout(() => {
        navigate('/homepage');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      setToast({
        message: error.message || 'Registration failed. Please check your verification code.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    setIsLoading(true);
    try {
      await authAPI.resendEmailVerification(formData.email);
      setToast({
        message: '📧 Verification code resent successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Resend error:', error);
      setToast({
        message: error.message || 'Failed to resend verification code',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between login and signup forms
  const toggleForms = () => {
    setIsSignup(!isSignup);
    setShowEmailVerification(false);
    setVerificationCode('');
    setFormData({
      email: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      rememberMe: false
    });
    setErrors({});
    setShowPassword({
      login: false,
      signup: false,
      confirm: false
    });
  };

  // Handle Google authentication
  const handleGoogleAuth = () => {
    alert('Google authentication would be implemented here');
  };

  // Add ripple effect on button click
  const addRippleEffect = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'rippleAnimation 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <>
      <Navbar darkMode={false} />
      <div className={styles.authContainer}>
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Custom Cursor Elements */}
        <div ref={cursorDotRef} className="cursor-dot"></div>
        <div ref={cursorOutlineRef} className="cursor-outline"></div>
        <div ref={cursorTrailRef} className="cursor-trail"></div>
        <div ref={cursorGlowRef} className="cursor-glow"></div>

      {/* Left Side - Animated Visual */}
      <div className={styles.authVisual}>
        <div className={styles.orbsContainer}>
          <div ref={orb1Ref} className={`${styles.orb} ${styles.orb1}`}></div>
          <div ref={orb2Ref} className={`${styles.orb} ${styles.orb2}`}></div>
          <div ref={orb3Ref} className={`${styles.orb} ${styles.orb3}`}></div>
        </div>
        <div ref={particlesRef} className={styles.particles}></div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.authFormContainer}>
        <div ref={formWrapperRef} className={styles.formWrapper}>
          {/* Logo */}
          <div className={styles.authLogo}>
            <div className={styles.logocon}>
              <a href="#" className={styles.logosign}>
                <img src={logo} alt="Autoboy Logo" />
              </a>
            </div>
          </div>

          {/* Form Title */}
          <h2 className={styles.formTitle}>
            {isSignup ? 'Create An Account' : 'Welcome Back'}
          </h2>

          {/* Form */}
          {isSignup && showEmailVerification ? (
            // Email Verification Screen
            <form
              className={styles.authForm}
              onSubmit={handleVerifyAndRegister}
            >
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Verification</label>
                <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                  We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setErrors({});
                  }}
                  className={styles.formInput}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem'}}
                />
                {errors.verification && <span style={{color: '#EF4444', fontSize: '0.875rem'}}>{errors.verification}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              {/* Resend Code */}
              <div style={{textAlign: 'center', marginTop: '1rem'}}>
                <button
                  type="button"
                  onClick={resendVerificationCode}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.875rem'
                  }}
                >
                  Resend verification code
                </button>
              </div>

              {/* Back to signup */}
              <div style={{textAlign: 'center', marginTop: '1rem'}}>
                <button
                  type="button"
                  onClick={() => setShowEmailVerification(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  ← Back to signup
                </button>
              </div>
            </form>
          ) : (
            // Regular Login/Signup Form
            <form
              className={styles.authForm}
              onSubmit={isSignup ? handleSignup : handleLogin}
            >
              {/* Email Field */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Enter your email"
                  required
                />
                {errors.email && <span style={{color: '#EF4444', fontSize: '0.875rem'}}>{errors.email}</span>}
              </div>

              {/* Full Name Field (Signup only) */}
              {isSignup && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Enter your full name"
                  required
                />
                {errors.fullName && <span style={{color: '#EF4444', fontSize: '0.875rem'}}>{errors.fullName}</span>}
              </div>
            )}

            {/* Phone Number Field (Signup only) */}
            {isSignup && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="0801 234 5678 or +2348012345678"
                  required
                />
                {errors.phoneNumber && <span style={{color: '#EF4444', fontSize: '0.875rem'}}>{errors.phoneNumber}</span>}
              </div>
            )}

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {isSignup ? 'Create Password' : 'Password'}
              </label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword[isSignup ? 'signup' : 'login'] ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePassword(isSignup ? 'signup' : 'login')}
                >
                  <i className={`far ${showPassword[isSignup ? 'signup' : 'login'] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <span style={{color: '#EF4444', fontSize: '0.875rem'}}>{errors.password}</span>}
            </div>

            {/* Confirm Password Field (Signup only) */}
            {isSignup && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm Password</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => togglePassword('confirm')}
                  >
                    <i className={`far ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && <span style={{color: '#EF4444', fontSize: '0.875rem'}}>{errors.confirmPassword}</span>}
              </div>
            )}

            {/* Remember me checkbox (Login only) */}
            {!isSignup && (
              <div className={styles.checkboxGroup}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    id="remember"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className={styles.checkboxInput}
                  />
                  <label htmlFor="remember" className={styles.checkboxLabel}>
                    Remember me
                  </label>
                </div>
                <a href="#" className={styles.forgotLink}>Forgot Password?</a>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div style={{color: '#EF4444', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem'}}>
                {errors.general}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`${styles.submitBtn} ${(isLoading || apiLoading) ? styles.loading : ''}`}
              onClick={addRippleEffect}
              disabled={isLoading || apiLoading}
            >
              {(isLoading || apiLoading) ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
            </button>
          </form>
          )}

          {/* Divider - only show for login or initial signup (not verification) */}
          {!showEmailVerification && (
          <>
            <div className={styles.authDivider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>
                Or {isSignup ? 'sign up' : 'login'} with
              </span>
              <div className={styles.dividerLine}></div>
            </div>

            {/* Social Auth */}
            <div className={styles.socialAuth}>
              <button
                className={styles.socialBtn}
                onClick={(e) => {
                  addRippleEffect(e);
                  handleGoogleAuth();
                }}
              >
                <GoogleIcon />
                Google
              </button>
            </div>
          </>
          )}

          {/* Auth Footer */}
          <div className={styles.authFooter}>
            {isSignup ? "Have an account? " : "Don't have an account? "}
            <a href="#" onClick={(e) => { e.preventDefault(); toggleForms(); }}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </a>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default LoginSignup;