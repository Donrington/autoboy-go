import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faBox, faShoppingCart, faDollarSign, faChartLine, faCog,
  faBars, faMoon, faSun, faPlus, faTruck, faChartPie, faMobileAlt,
  faCheckCircle, faNairaSign, faEdit, faEye, faTrash, faFilter,
  faSearch, faUpload, faSave, faUser, faEnvelope, faPhone, faMapMarkerAlt,
  faTimes, faCheck, faClipboardList, faWallet, faBell, faSignOutAlt,
  faUserCircle, faShieldAlt, faQuestionCircle, faHome, faCrown, faRocket,
  faStar, faGem, faHistory
} from '@fortawesome/free-solid-svg-icons';
import { sellerAPI, notificationsAPI, walletAPI } from '../services/api';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from 'chart.js';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import CustomCursor from './CustomCursor';
import Toast from './Toast';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';
import './SellerDashboard.css';
import './WalletEnhanced.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('autoboyDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Loading...',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    bio: '',
    isVerified: false
  });
  const [settingsForm, setSettingsForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    bio: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [stats, setStats] = useState({
    activeProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
    totalEarnings: 0
  });
  const [earningsData, setEarningsData] = useState({
    totalRevenue: 0,
    monthlyBreakdown: [],
    profitMargin: 0
  });
  const [salesAnalytics, setSalesAnalytics] = useState({
    dailySales: [],
    weeklySales: [],
    growthRate: 0,
    totalOrders: 0,
    monthlyRevenue: 0
  });
  const [productAnalytics, setProductAnalytics] = useState({
    topCategories: [],
    topProducts: []
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    growthRate: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    sellerRating: 0,
    totalRatings: 0
  });
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    brand: '',
    model: '',
    condition: 'new',
    price: '',
    description: '',
    specifications: '',
    quantity: '',
    location: '',
    swapAvailable: false,
    tags: ''
  });

  // Notifications data - now from API
  const [notifications, setNotifications] = useState([]);

  // Wallet data
  const [walletBalance, setWalletBalance] = useState({
    balance: 0,
    heldBalance: 0,
    currency: 'NGN'
  });
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankAccount: '',
    bankName: '',
    accountName: ''
  });
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // Products and Orders data from API
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch all data from API
  useEffect(() => {
    const fetchAllData = async () => {
      // Check if user has authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No authentication token found. Please log in.');
        setToast({
          message: 'Please log in to access the seller dashboard',
          type: 'error'
        });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
        return;
      }

      // DEBUG: Decode JWT token to check user_type
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔐 JWT Token Payload:', payload);
          console.log('👤 User Type:', payload.user_type);
          console.log('📧 User Email:', payload.email);
          console.log('⏰ Token Expiry:', new Date(payload.exp * 1000).toLocaleString());

          // Check if user is actually a seller
          if (payload.user_type !== 'seller') {
            console.error('❌ Access Denied: User is not a seller. Current user_type:', payload.user_type);
            setToast({
              message: `Access Denied: You are not approved as a seller. Your account type is "${payload.user_type}". Please apply to become a seller first.`,
              type: 'error'
            });
            setTimeout(() => {
              window.location.href = '/become-seller';
            }, 3000);
            return;
          } else {
            console.log('✅ User is a verified seller');
          }
        }
      } catch (e) {
        console.error('Error decoding JWT token:', e);
      }

      // Fetch user profile
      try {
        const profileResponse = await sellerAPI.getProfile();
        console.log('Profile Response:', profileResponse); // Debug log

        if (profileResponse && profileResponse.data) {
          const profile = profileResponse.data.profile || {};
          const businessInfo = profileResponse.data.business_info || {};

          // For sellers, the business name is stored in first_name field (until backend is updated)
          const displayName = profile.business_name ||
                             businessInfo.business_name ||
                             profile.first_name ||
                             'My Shop';

          const profileData = {
            name: displayName,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profileResponse.data.email || '',  // Now from API
            phone: profileResponse.data.phone || '',  // Now from API
            businessName: profile.business_name || businessInfo.business_name || profile.first_name || '',
            businessAddress: profile.business_address || businessInfo.business_address || '',
            businessPhone: profile.business_phone || businessInfo.business_phone || profileResponse.data.phone || '',
            bio: profile.bio || '',
            isVerified: profile.verification_status === 'verified' || false
          };

          console.log('Parsed Profile Data:', profileData); // Debug log

          setUserProfile(profileData);

          // Initialize settings form with profile data
          setSettingsForm({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            businessName: profileData.businessName,
            businessAddress: profileData.businessAddress,
            businessPhone: profileData.businessPhone,
            bio: profileData.bio
          });

          // Set seller rating for performance metrics
          const rating = profileResponse.data.rating || 0;
          const totalRatings = profileResponse.data.total_ratings || 0;
          setPerformanceMetrics(prev => ({
            ...prev,
            sellerRating: rating,
            totalRatings: totalRatings
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);

        // Check if it's an authentication error
        if (error.isAuthError || error.message.includes('Invalid or expired token')) {
          setToast({
            message: 'Your session has expired. Please log in again.',
            type: 'error'
          });
          setTimeout(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth';
          }, 2000);
          return;
        }

        // Get from localStorage as fallback for other errors
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const profile = user.profile || {};

        const displayName = profile.business_name ||
                           profile.first_name ||
                           user.email ||
                           'My Shop';

        const profileData = {
          name: displayName,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          businessName: profile.business_name || profile.first_name || '',
          businessAddress: profile.business_address || '',
          businessPhone: profile.business_phone || user.phone || '',
          bio: profile.bio || '',
          isVerified: profile.verification_status === 'verified' || false
        };

        setUserProfile(profileData);

        // Initialize settings form with profile data
        setSettingsForm({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          businessName: profileData.businessName,
          businessAddress: profileData.businessAddress,
          businessPhone: profileData.businessPhone,
          bio: profileData.bio
        });
      }

      // Fetch dashboard stats
      try {
        setIsLoadingStats(true);
        const response = await sellerAPI.getDashboard();

        if (response && response.data) {
          setStats({
            activeProducts: response.data.total_products || 0,
            pendingOrders: response.data.pending_orders || 0,
            totalSales: response.data.total_orders || 0,
            totalEarnings: response.data.total_revenue || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
      }

      // Fetch products
      try {
        setIsLoadingProducts(true);
        const productsResponse = await sellerAPI.getProducts({ limit: 10 });

        if (productsResponse && productsResponse.data) {
          const productList = productsResponse.data.products || productsResponse.data || [];
          setProducts(productList.map(product => ({
            id: product._id || product.id,
            name: product.title || product.name,
            price: product.price || 0,
            stock: product.quantity || 0,
            sold: product.sold_count || 0,
            status: product.status || 'active',
            image: product.images && product.images[0] ? product.images[0] : '/api/placeholder/80/80'
          })));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }

      // Fetch orders
      try {
        setIsLoadingOrders(true);
        const ordersResponse = await sellerAPI.getOrders({ limit: 10 });

        if (ordersResponse && ordersResponse.data) {
          const orderList = ordersResponse.data.orders || ordersResponse.data || [];
          setOrders(orderList.map(order => ({
            id: order.order_id || order._id || order.id,
            customer: order.buyer_name || order.customer_name || 'Customer',
            product: order.product_title || order.product_name || 'Product',
            amount: order.total_amount || order.amount || 0,
            status: order.status || 'pending',
            date: order.created_at ? new Date(order.created_at) : new Date(),
            email: order.buyer_email || order.customer_email || ''
          })));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }

      // Fetch earnings/revenue analytics
      try {
        setIsLoadingEarnings(true);
        const earningsResponse = await sellerAPI.getRevenueAnalytics();

        if (earningsResponse && earningsResponse.data) {
          setEarningsData({
            totalRevenue: earningsResponse.data.total_revenue || 0,
            monthlyBreakdown: earningsResponse.data.monthly_breakdown || [],
            profitMargin: earningsResponse.data.profit_margin || 0
          });
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setIsLoadingEarnings(false);
      }

      // Fetch sales analytics for charts
      try {
        const salesResponse = await sellerAPI.getSalesAnalytics();
        console.log('Sales Analytics Response:', salesResponse);

        if (salesResponse && salesResponse.data) {
          const weeklySales = salesResponse.data.weekly_sales || [];
          const growthRate = salesResponse.data.growth_rate || 0;
          const totalOrders = salesResponse.data.total_orders || 0;
          const monthlyRevenue = salesResponse.data.monthly_revenue || 0;

          setSalesAnalytics({
            dailySales: salesResponse.data.daily_sales || [],
            weeklySales: weeklySales,
            growthRate: growthRate,
            totalOrders: totalOrders,
            monthlyRevenue: monthlyRevenue
          });

          // Calculate average order value for performance metrics
          const avgOrderValue = totalOrders > 0 ? monthlyRevenue / totalOrders : 0;

          setPerformanceMetrics(prev => ({
            ...prev,
            growthRate: growthRate,
            averageOrderValue: avgOrderValue,
            totalOrders: totalOrders
          }));
        }
      } catch (error) {
        console.error('Error fetching sales analytics:', error);
      }

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch product analytics for category chart
      try {
        const productResponse = await sellerAPI.getProductAnalytics();
        console.log('Product Analytics Response:', productResponse);

        if (productResponse && productResponse.data) {
          setProductAnalytics({
            topCategories: productResponse.data.top_categories || [],
            topProducts: productResponse.data.top_products || []
          });
        }
      } catch (error) {
        console.error('Error fetching product analytics:', error);
      }

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch notifications
      try {
        const notificationsResponse = await notificationsAPI.getNotifications();
        if (notificationsResponse && notificationsResponse.data) {
          const notifList = notificationsResponse.data.notifications || notificationsResponse.data || [];
          setNotifications(notifList.slice(0, 10)); // Show last 10
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch wallet data
      try {
        const balanceResponse = await walletAPI.getBalance();
        if (balanceResponse && balanceResponse.data) {
          setWalletBalance({
            balance: balanceResponse.data.balance || 0,
            heldBalance: balanceResponse.data.held_balance || 0,
            currency: balanceResponse.data.currency || 'NGN'
          });
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchAllData();
  }, []);

  // Fetch wallet transactions when wallet section is active
  useEffect(() => {
    if (activeSection === 'wallet') {
      fetchWalletTransactions();
    }
  }, [activeSection]);

  // Chart data - Dynamic from API
  const salesChartData = {
    labels: salesAnalytics.weeklySales.length > 0
      ? salesAnalytics.weeklySales.map(item => item.day || item.label)
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (₦)',
        data: salesAnalytics.weeklySales.length > 0
          ? salesAnalytics.weeklySales.map(item => item.amount || item.sales || 0)
          : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const categoryChartData = {
    labels: productAnalytics.topCategories.length > 0
      ? productAnalytics.topCategories.map(item => item.category || item.name)
      : ['No Data'],
    datasets: [
      {
        data: productAnalytics.topCategories.length > 0
          ? productAnalytics.topCategories.map(item => item.count || item.sales || 0)
          : [0],
        backgroundColor: productAnalytics.topCategories.length > 0
          ? ['#22C55E', '#16A34A', '#4ADE80', '#10B981', '#6B7280']
          : ['#6B7280'],
        borderWidth: 0,
      }
    ]
  };

  const monthlyEarningsData = {
    labels: earningsData.monthlyBreakdown.length > 0
      ? earningsData.monthlyBreakdown.map(item => item.month)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Earnings (₦)',
        data: earningsData.monthlyBreakdown.length > 0
          ? earningsData.monthlyBreakdown.map(item => item.revenue)
          : [0, 0, 0, 0, 0, 0],
        backgroundColor: '#22C55E',
        borderRadius: 8,
      }
    ]
  };

  useEffect(() => {
    document.body.className = isDarkMode ? 'autoboy-dash-dark-mode' : '';
    localStorage.setItem('autoboyDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      const profileUpdateData = {
        phone: settingsForm.phone,
        profile: {
          first_name: settingsForm.firstName,
          last_name: settingsForm.lastName,
          business_name: settingsForm.businessName,
          business_address: settingsForm.businessAddress,
          business_phone: settingsForm.businessPhone,
          bio: settingsForm.bio
        }
      };

      await sellerAPI.updateProfile(profileUpdateData);

      // Update local userProfile state
      setUserProfile(prev => ({
        ...prev,
        name: settingsForm.businessName,
        firstName: settingsForm.firstName,
        lastName: settingsForm.lastName,
        phone: settingsForm.phone,
        businessName: settingsForm.businessName,
        businessAddress: settingsForm.businessAddress,
        businessPhone: settingsForm.businessPhone,
        bio: settingsForm.bio
      }));

      setToast({ message: '✓ Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      shipped: '#3b82f6',
      delivered: '#22c55e',
      cancelled: '#ef4444',
      active: '#22c55e',
      out_of_stock: '#ef4444',
      draft: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      active: 'Active',
      out_of_stock: 'Out of Stock',
      draft: 'Draft'
    };
    return texts[status] || status;
  };

  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setProductImages(prev => [...prev, ...imageUrls].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    // Here you would send data to your backend
    console.log('New Product:', newProduct);
    console.log('Product Images:', productImages);
    setToast({ message: '✓ Product added successfully!', type: 'success' });
    setShowAddProductForm(false);
    setNewProduct({
      title: '',
      category: '',
      brand: '',
      model: '',
      condition: 'new',
      price: '',
      description: '',
      specifications: '',
      quantity: '',
      location: '',
      swapAvailable: false,
      tags: ''
    });
    setProductImages([]);
  };

  // Wallet Functions
  const fetchWalletTransactions = async () => {
    setIsLoadingWallet(true);
    try {
      const response = await walletAPI.getTransactions();
      if (response && response.data) {
        setWalletTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setToast({ message: 'Failed to load transactions', type: 'error' });
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();

    // Validate amount
    const amount = parseFloat(withdrawalForm.amount);
    if (isNaN(amount) || amount < 1000) {
      setToast({ message: 'Minimum withdrawal amount is ₦1,000', type: 'error' });
      return;
    }

    if (amount > walletBalance.balance) {
      setToast({ message: 'Insufficient wallet balance', type: 'error' });
      return;
    }

    setIsProcessingWithdrawal(true);
    try {
      const response = await walletAPI.requestWithdrawal({
        amount: amount,
        bank_account: withdrawalForm.bankAccount,
        bank_name: withdrawalForm.bankName,
        account_name: withdrawalForm.accountName
      });

      if (response && response.data) {
        setToast({ message: '✓ Withdrawal request submitted successfully!', type: 'success' });
        setShowWithdrawModal(false);
        setWithdrawalForm({
          amount: '',
          bankAccount: '',
          bankName: '',
          accountName: ''
        });

        // Refresh wallet balance
        const balanceResponse = await walletAPI.getBalance();
        if (balanceResponse && balanceResponse.data) {
          setWalletBalance({
            balance: balanceResponse.data.balance || 0,
            heldBalance: balanceResponse.data.held_balance || 0,
            currency: balanceResponse.data.currency || 'NGN'
          });
        }
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      setToast({ message: 'Failed to process withdrawal. Please try again.', type: 'error' });
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const handleWithdrawalFormChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#F3F4F6' : '#1F2937',
          padding: 20,
          usePointStyle: true,
        }
      }
    }
  };

  const renderDashboardContent = () => (
    <div className="autoboy-dash-content-wrapper">
      {/* Quick Actions */}
      <div className="autoboy-dash-quick-actions">
        <button className="autoboy-dash-quick-action" onClick={() => setActiveSection('products')}>
          <div className="autoboy-dash-quick-action-icon">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div>
            <h3>Add Product</h3>
            <p>List a new product</p>
          </div>
        </button>
        <button className="autoboy-dash-quick-action" onClick={() => setActiveSection('orders')}>
          <div className="autoboy-dash-quick-action-icon">
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <div>
            <h3>Manage Orders</h3>
            <p>Process orders</p>
          </div>
        </button>
        <button className="autoboy-dash-quick-action" onClick={() => setActiveSection('analytics')}>
          <div className="autoboy-dash-quick-action-icon">
            <FontAwesomeIcon icon={faChartPie} />
          </div>
          <div>
            <h3>View Analytics</h3>
            <p>Sales insights</p>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="autoboy-dash-stats">
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header">
            <div className="autoboy-dash-stat-icon">
              <FontAwesomeIcon icon={faMobileAlt} />
            </div>
          </div>
          <div className="autoboy-dash-stat-value">{stats.activeProducts}</div>
          <div className="autoboy-dash-stat-label">Active Products</div>
        </div>

        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header">
            <div className="autoboy-dash-stat-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
          </div>
          <div className="autoboy-dash-stat-value">{stats.pendingOrders}</div>
          <div className="autoboy-dash-stat-label">Pending Orders</div>
        </div>

        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header">
            <div className="autoboy-dash-stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
          <div className="autoboy-dash-stat-value">{stats.totalSales}</div>
          <div className="autoboy-dash-stat-label">Total Sales</div>
        </div>

        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header">
            <div className="autoboy-dash-stat-icon">
              <FontAwesomeIcon icon={faNairaSign} />
            </div>
          </div>
          <div className="autoboy-dash-stat-value">{formatCurrency(stats.totalEarnings)}</div>
          <div className="autoboy-dash-stat-label">Total Earnings</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="autoboy-dash-content">
        {/* Recent Orders */}
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Recent Orders</h2>
          </div>
          <div className="autoboy-dash-section-content">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="autoboy-dash-order-item">
                <div className="autoboy-dash-order-info">
                  <h4>{order.product}</h4>
                  <p>{order.customer}</p>
                  <span className="autoboy-dash-order-id">{order.id}</span>
                </div>
                <div className="autoboy-dash-order-details">
                  <div className="autoboy-dash-order-amount">{formatCurrency(order.amount)}</div>
                  <div
                    className="autoboy-dash-order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Overview */}
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Sales Overview</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddProductForm = () => (
    <div className="autoboy-dash-modal-overlay" onClick={() => setShowAddProductForm(false)}>
      <div className="autoboy-dash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="autoboy-dash-modal-header">
          <h2>Add New Product</h2>
          <button className="autoboy-dash-modal-close" onClick={() => setShowAddProductForm(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmitProduct} className="autoboy-dash-product-form">
          {/* Product Images */}
          <div className="autoboy-dash-form-section">
            <h3>Product Images (Max 10)</h3>
            <div className="autoboy-dash-image-upload-area">
              <input
                type="file"
                id="product-images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="product-images" className="autoboy-dash-upload-label">
                <FontAwesomeIcon icon={faUpload} />
                <span>Click to upload images</span>
              </label>
            </div>

            {productImages.length > 0 && (
              <div className="autoboy-dash-image-preview-grid">
                {productImages.map((img, index) => (
                  <div key={index} className="autoboy-dash-image-preview">
                    <img src={img} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      className="autoboy-dash-remove-image"
                      onClick={() => removeImage(index)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="autoboy-dash-form-section">
            <h3>Basic Information</h3>
            <div className="autoboy-dash-form-row">
              <div className="autoboy-dash-form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newProduct.title}
                  onChange={handleProductInputChange}
                  placeholder="e.g., iPhone 15 Pro Max 256GB"
                  required
                />
              </div>
            </div>

            <div className="autoboy-dash-form-row">
              <div className="autoboy-dash-form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleProductInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="smartphones">Smartphones</option>
                  <option value="tablets">Tablets</option>
                  <option value="laptops">Laptops</option>
                  <option value="smartwatches">Smartwatches</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div className="autoboy-dash-form-group">
                <label>Condition *</label>
                <select
                  name="condition"
                  value={newProduct.condition}
                  onChange={handleProductInputChange}
                  required
                >
                  <option value="new">Brand New</option>
                  <option value="uk_used">UK Used</option>
                  <option value="nigeria_used">Nigeria Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>

            <div className="autoboy-dash-form-row">
              <div className="autoboy-dash-form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={newProduct.brand}
                  onChange={handleProductInputChange}
                  placeholder="e.g., Apple, Samsung"
                />
              </div>

              <div className="autoboy-dash-form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  value={newProduct.model}
                  onChange={handleProductInputChange}
                  placeholder="e.g., iPhone 15 Pro Max"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="autoboy-dash-form-section">
            <h3>Pricing & Stock</h3>
            <div className="autoboy-dash-form-row">
              <div className="autoboy-dash-form-group">
                <label>Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleProductInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="autoboy-dash-form-group">
                <label>Quantity in Stock *</label>
                <input
                  type="number"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleProductInputChange}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="autoboy-dash-form-section">
            <h3>Product Description</h3>
            <div className="autoboy-dash-form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleProductInputChange}
                rows="5"
                placeholder="Describe your product in detail..."
                required
              />
            </div>

            <div className="autoboy-dash-form-group">
              <label>Specifications</label>
              <textarea
                name="specifications"
                value={newProduct.specifications}
                onChange={handleProductInputChange}
                rows="4"
                placeholder="Storage: 256GB, RAM: 8GB, Color: Space Black..."
              />
            </div>
          </div>

          {/* Location & Additional */}
          <div className="autoboy-dash-form-section">
            <h3>Location & Additional Info</h3>
            <div className="autoboy-dash-form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={newProduct.location}
                onChange={handleProductInputChange}
                placeholder="e.g., Lagos, Ikeja"
                required
              />
            </div>

            <div className="autoboy-dash-form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={newProduct.tags}
                onChange={handleProductInputChange}
                placeholder="e.g., smartphone, apple, ios"
              />
            </div>

            <div className="autoboy-dash-form-group">
              <label className="autoboy-dash-checkbox-label">
                <input
                  type="checkbox"
                  name="swapAvailable"
                  checked={newProduct.swapAvailable}
                  onChange={handleProductInputChange}
                />
                <span>Available for Swap/Exchange</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="autoboy-dash-form-actions">
            <button
              type="button"
              className="autoboy-dash-btn autoboy-dash-btn-secondary"
              onClick={() => setShowAddProductForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary">
              <FontAwesomeIcon icon={faSave} />
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderProductsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">My Products</h2>
          <button
            className="autoboy-dash-btn autoboy-dash-btn-primary"
            onClick={() => setShowAddProductForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Product
          </button>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No products found. Click "Add Product" to create your first listing.
                    </td>
                  </tr>
                ) : products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="autoboy-dash-product-info">
                        <img src={product.image} alt={product.name} className="autoboy-dash-product-image" />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>{product.sold}</td>
                    <td>
                      <span
                        className="autoboy-dash-status-badge"
                        style={{ backgroundColor: getStatusColor(product.status) }}
                      >
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="autoboy-dash-action-btn">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="autoboy-dash-action-btn autoboy-dash-action-btn-danger">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Order Management</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn">
              <FontAwesomeIcon icon={faFilter} />
              Filter
            </button>
            <div className="autoboy-dash-search">
              <FontAwesomeIcon icon={faSearch} />
              <input type="text" placeholder="Search orders..." />
            </div>
          </div>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingOrders ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No orders yet. Orders will appear here when customers purchase your products.
                    </td>
                  </tr>
                ) : orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <div className="autoboy-dash-customer-info">
                        <div>
                          <div>{order.customer}</div>
                          <div className="autoboy-dash-customer-email">{order.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{order.product}</td>
                    <td>{formatCurrency(order.amount)}</td>
                    <td>{format(order.date, 'MMM dd, yyyy')}</td>
                    <td>
                      <span
                        className="autoboy-dash-status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button className="autoboy-dash-action-btn">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEarningsContent = () => {
    const currentMonthEarnings = earningsData.monthlyBreakdown.length > 0
      ? earningsData.monthlyBreakdown[earningsData.monthlyBreakdown.length - 1]?.revenue || 0
      : 0;

    const availableBalance = earningsData.totalRevenue * 0.85; // 85% available
    const pendingBalance = earningsData.totalRevenue * 0.15; // 15% pending

    return (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-earnings-cards">
        <div className="autoboy-dash-earnings-card">
          <div className="autoboy-dash-earnings-icon">
            <FontAwesomeIcon icon={faWallet} />
          </div>
          <div className="autoboy-dash-earnings-info">
            <h3>Available Balance</h3>
            <div className="autoboy-dash-earnings-amount">
              {isLoadingEarnings ? 'Loading...' : formatCurrency(availableBalance)}
            </div>
          </div>
        </div>
        <div className="autoboy-dash-earnings-card">
          <div className="autoboy-dash-earnings-icon">
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
          <div className="autoboy-dash-earnings-info">
            <h3>Pending Earnings</h3>
            <div className="autoboy-dash-earnings-amount">
              {isLoadingEarnings ? 'Loading...' : formatCurrency(pendingBalance)}
            </div>
          </div>
        </div>
        <div className="autoboy-dash-earnings-card">
          <div className="autoboy-dash-earnings-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="autoboy-dash-earnings-info">
            <h3>This Month</h3>
            <div className="autoboy-dash-earnings-amount">
              {isLoadingEarnings ? 'Loading...' : formatCurrency(currentMonthEarnings)}
            </div>
          </div>
        </div>
      </div>

      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Monthly Earnings</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Bar data={monthlyEarningsData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Earnings Breakdown</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-earnings-breakdown">
              <div className="autoboy-dash-breakdown-item">
                <span>Product Sales</span>
                <span>{isLoadingEarnings ? 'Loading...' : formatCurrency(earningsData.totalRevenue)}</span>
              </div>
              <div className="autoboy-dash-breakdown-item">
                <span>Commission (10%)</span>
                <span>-{isLoadingEarnings ? 'Loading...' : formatCurrency(earningsData.totalRevenue * 0.10)}</span>
              </div>
              <div className="autoboy-dash-breakdown-item">
                <span>Transaction Fees (2%)</span>
                <span>-{isLoadingEarnings ? 'Loading...' : formatCurrency(earningsData.totalRevenue * 0.02)}</span>
              </div>
              <hr />
              <div className="autoboy-dash-breakdown-item autoboy-dash-breakdown-total">
                <span>Net Earnings</span>
                <span>{isLoadingEarnings ? 'Loading...' : formatCurrency(earningsData.totalRevenue * 0.88)}</span>
              </div>
              <div className="autoboy-dash-breakdown-item" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #E5E7EB' }}>
                <span>Profit Margin</span>
                <span style={{ color: '#22C55E', fontWeight: '600' }}>
                  {isLoadingEarnings ? 'Loading...' : `${earningsData.profitMargin.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const renderAnalyticsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Sales Trend</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Product Categories</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Doughnut data={categoryChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Performance Metrics</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-metrics-grid">
              <div className="autoboy-dash-metric">
                <h4>Growth Rate</h4>
                <div className="autoboy-dash-metric-value" style={{ color: performanceMetrics.growthRate >= 0 ? '#22C55E' : '#EF4444' }}>
                  {performanceMetrics.growthRate >= 0 ? '+' : ''}{performanceMetrics.growthRate.toFixed(1)}%
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  vs last month
                </p>
              </div>
              <div className="autoboy-dash-metric">
                <h4>Average Order Value</h4>
                <div className="autoboy-dash-metric-value">{formatCurrency(performanceMetrics.averageOrderValue)}</div>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  {performanceMetrics.totalOrders} orders this month
                </p>
              </div>
              <div className="autoboy-dash-metric">
                <h4>Total Orders</h4>
                <div className="autoboy-dash-metric-value">{performanceMetrics.totalOrders}</div>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  this month
                </p>
              </div>
              <div className="autoboy-dash-metric">
                <h4>Seller Rating</h4>
                <div className="autoboy-dash-metric-value">
                  <span style={{ color: '#F59E0B' }}>
                    {performanceMetrics.sellerRating > 0 ? performanceMetrics.sellerRating.toFixed(1) : '0.0'}/5
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                  {performanceMetrics.totalRatings} {performanceMetrics.totalRatings === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWalletContent = () => {
    const totalBalance = walletBalance.balance + walletBalance.heldBalance;

    return (
      <div className="autoboy-dash-content-wrapper">
        <div className="autoboy-dash-content">
          {/* Enhanced Wallet Header */}
          <div className="autoboy-wallet-header">
            <div className="autoboy-wallet-header-content">
              <div className="autoboy-wallet-header-icon">
                <FontAwesomeIcon icon={faWallet} />
              </div>
              <div className="autoboy-wallet-header-text">
                <h1 className="autoboy-wallet-title">My Wallet</h1>
                <p className="autoboy-wallet-subtitle">Manage your earnings and withdrawals</p>
              </div>
            </div>
            <div className="autoboy-wallet-total-balance">
              <span className="autoboy-wallet-total-label">Total Balance</span>
              <span className="autoboy-wallet-total-amount">{formatCurrency(totalBalance)}</span>
            </div>
          </div>

          {/* Enhanced Balance Cards */}
          <div className="autoboy-wallet-cards-grid">
            {/* Available Balance Card */}
            <div className="autoboy-wallet-balance-card autoboy-wallet-available">
              <div className="autoboy-wallet-card-icon">
                <FontAwesomeIcon icon={faWallet} />
              </div>
              <div className="autoboy-wallet-card-content">
                <span className="autoboy-wallet-card-label">Available Balance</span>
                <h2 className="autoboy-wallet-card-amount">{formatCurrency(walletBalance.balance)}</h2>
                <span className="autoboy-wallet-card-subtitle">Ready to withdraw</span>
              </div>
              <div className="autoboy-wallet-card-decoration"></div>
            </div>

            {/* Held Balance Card */}
            <div className="autoboy-wallet-balance-card autoboy-wallet-held">
              <div className="autoboy-wallet-card-icon">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
              <div className="autoboy-wallet-card-content">
                <span className="autoboy-wallet-card-label">Held Balance</span>
                <h2 className="autoboy-wallet-card-amount">{formatCurrency(walletBalance.heldBalance)}</h2>
                <span className="autoboy-wallet-card-subtitle">Pending withdrawals</span>
              </div>
              <div className="autoboy-wallet-card-decoration"></div>
            </div>

            {/* Quick Actions Card */}
            <div className="autoboy-wallet-actions-card">
              <h3 className="autoboy-wallet-actions-title">Quick Actions</h3>
              <div className="autoboy-wallet-actions-buttons">
                <button
                  className="autoboy-wallet-action-btn autoboy-wallet-withdraw-btn"
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={walletBalance.balance < 1000}
                >
                  <FontAwesomeIcon icon={faDollarSign} />
                  <span>Withdraw</span>
                </button>
                <button className="autoboy-wallet-action-btn autoboy-wallet-history-btn">
                  <FontAwesomeIcon icon={faChartLine} />
                  <span>View History</span>
                </button>
              </div>
              {walletBalance.balance < 1000 && (
                <div className="autoboy-wallet-minimum-notice">
                  <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.5rem' }} />
                  Minimum withdrawal: ₦1,000
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Transaction History */}
          <div className="autoboy-wallet-transactions">
            <div className="autoboy-wallet-transactions-header">
              <div>
                <h2 className="autoboy-wallet-transactions-title">
                  <FontAwesomeIcon icon={faHistory} style={{ marginRight: '0.75rem' }} />
                  Transaction History
                </h2>
                <p className="autoboy-wallet-transactions-subtitle">Recent wallet activity</p>
              </div>
              <div className="autoboy-wallet-transactions-actions">
                <button className="autoboy-wallet-filter-btn">
                  <FontAwesomeIcon icon={faFilter} />
                  Filter
                </button>
              </div>
            </div>

            <div className="autoboy-wallet-transactions-content">
              {isLoadingWallet ? (
                <div className="autoboy-wallet-empty-state">
                  <div className="autoboy-wallet-loading-spinner"></div>
                  <p>Loading transactions...</p>
                </div>
              ) : walletTransactions.length === 0 ? (
                <div className="autoboy-wallet-empty-state">
                  <div className="autoboy-wallet-empty-icon">
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  <h3>No transactions yet</h3>
                  <p>Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="autoboy-wallet-transactions-list">
                  {walletTransactions.map((transaction, index) => (
                    <div key={transaction._id || transaction.id || index} className="autoboy-wallet-transaction-item">
                      <div className="autoboy-wallet-transaction-icon-wrapper">
                        <div className={`autoboy-wallet-transaction-icon ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                          <FontAwesomeIcon icon={transaction.type === 'credit' ? faCheckCircle : faTimes} />
                        </div>
                      </div>

                      <div className="autoboy-wallet-transaction-details">
                        <div className="autoboy-wallet-transaction-main">
                          <span className="autoboy-wallet-transaction-desc">
                            {transaction.description || 'Transaction'}
                          </span>
                          <span className={`autoboy-wallet-transaction-amount ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <div className="autoboy-wallet-transaction-meta">
                          <span className="autoboy-wallet-transaction-date">
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.375rem', fontSize: '0.75rem' }} />
                            {format(new Date(transaction.created_at), 'MMM d, yyyy - h:mm a')}
                          </span>
                          <span className={`autoboy-wallet-transaction-status ${transaction.status === 'completed' ? 'completed' : 'pending'}`}>
                            {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className={`autoboy-wallet-transaction-type-badge ${transaction.type}`}>
                        {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="autoboy-dash-modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="autoboy-dash-modal" onClick={(e) => e.stopPropagation()}>
              <div className="autoboy-dash-modal-header">
                <h2>Request Withdrawal</h2>
                <button className="autoboy-dash-modal-close" onClick={() => setShowWithdrawModal(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={handleWithdrawalSubmit}>
                <div className="autoboy-dash-modal-body">
                  <p style={{ marginBottom: '1.5rem', color: '#6B7280' }}>
                    Available Balance: <strong>{formatCurrency(walletBalance.balance)}</strong>
                  </p>

                  <div className="autoboy-dash-form-group">
                    <label htmlFor="amount">Withdrawal Amount (₦) *</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={withdrawalForm.amount}
                      onChange={handleWithdrawalFormChange}
                      min="1000"
                      max={walletBalance.balance}
                      required
                      placeholder="Minimum ₦1,000"
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                      Minimum withdrawal amount is ₦1,000
                    </p>
                  </div>

                  <div className="autoboy-dash-form-group">
                    <label htmlFor="bankName">Bank Name *</label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={withdrawalForm.bankName}
                      onChange={handleWithdrawalFormChange}
                      required
                      placeholder="e.g., GTBank"
                    />
                  </div>

                  <div className="autoboy-dash-form-group">
                    <label htmlFor="accountName">Account Name *</label>
                    <input
                      type="text"
                      id="accountName"
                      name="accountName"
                      value={withdrawalForm.accountName}
                      onChange={handleWithdrawalFormChange}
                      required
                      placeholder="Account holder name"
                    />
                  </div>

                  <div className="autoboy-dash-form-group">
                    <label htmlFor="bankAccount">Account Number *</label>
                    <input
                      type="text"
                      id="bankAccount"
                      name="bankAccount"
                      value={withdrawalForm.bankAccount}
                      onChange={handleWithdrawalFormChange}
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit account number"
                    />
                  </div>
                </div>

                <div className="autoboy-dash-modal-footer">
                  <button
                    type="button"
                    className="autoboy-dash-secondary-button"
                    onClick={() => setShowWithdrawModal(false)}
                    disabled={isProcessingWithdrawal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="autoboy-dash-primary-button"
                    disabled={isProcessingWithdrawal}
                  >
                    {isProcessingWithdrawal ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettingsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Profile Settings</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form" onSubmit={handleSettingsSave}>
              <div className="autoboy-dash-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userProfile.email || ''}
                  readOnly
                  className="autoboy-dash-readonly-input"
                  placeholder="your-email@example.com"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={settingsForm.firstName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, firstName: e.target.value })}
                  placeholder="Your first name"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={settingsForm.lastName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, lastName: e.target.value })}
                  placeholder="Your last name"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Business/Shop Name</label>
                <input
                  type="text"
                  value={settingsForm.businessName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                  placeholder="Your business or shop name"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Business Address</label>
                <input
                  type="text"
                  value={settingsForm.businessAddress}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessAddress: e.target.value })}
                  placeholder="Your business location/address"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Business Phone (Optional)</label>
                <input
                  type="tel"
                  value={settingsForm.businessPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, businessPhone: e.target.value })}
                  placeholder="Business contact number"
                />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Bio / Store Description</label>
                <textarea
                  rows="4"
                  value={settingsForm.bio}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  placeholder="Tell customers about your business..."
                ></textarea>
              </div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary" disabled={isSavingSettings}>
                <FontAwesomeIcon icon={faSave} />
                {isSavingSettings ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Notification Settings</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-notification-settings">
              <div className="autoboy-dash-notification-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Email notifications for new orders
                </label>
              </div>
              <div className="autoboy-dash-notification-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  SMS notifications for urgent updates
                </label>
              </div>
              <div className="autoboy-dash-notification-item">
                <label>
                  <input type="checkbox" />
                  Marketing emails
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getContentForSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'products':
        return renderProductsContent();
      case 'orders':
        return renderOrdersContent();
      case 'earnings':
        return renderEarningsContent();
      case 'wallet':
        return renderWalletContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <>
      <CustomCursor />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showAddProductForm && renderAddProductForm()}
      <div className="autoboy-dash-container">
      {/* Sidebar */}
      <div className={`autoboy-dash-sidebar ${isMobileSidebarOpen ? 'autoboy-dash-sidebar-open' : ''}`}>
        <div className="autoboy-dash-logo">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="AutoBoy"
          />
        </div>

        <div className="autoboy-dash-profile">
          <div className="autoboy-dash-profile-avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="autoboy-dash-profile-info">
            <h3 className="autoboy-dash-seller-name">{userProfile.name}</h3>
            <p className="autoboy-dash-seller-status">
              {userProfile.isVerified ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '0.25rem', color: '#22C55E' }} />
                  Verified Seller
                </>
              ) : (
                'Seller'
              )}
            </p>
          </div>
        </div>

        <ul className="autoboy-dash-nav">
          <li className="autoboy-dash-nav-item">
            <button
              className="autoboy-dash-nav-link"
              onClick={() => {
                navigate('/homepage');
                setIsMobileSidebarOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faHome} className="autoboy-dash-nav-icon" />
              Homepage
            </button>
          </li>
          {[
            { id: 'dashboard', icon: faChartBar, label: 'Dashboard' },
            { id: 'products', icon: faBox, label: 'Products' },
            { id: 'orders', icon: faShoppingCart, label: 'Orders' },
            { id: 'earnings', icon: faDollarSign, label: 'Earnings' },
            { id: 'wallet', icon: faWallet, label: 'Wallet' },
            { id: 'analytics', icon: faChartLine, label: 'Analytics' },
            { id: 'settings', icon: faCog, label: 'Settings' }
          ].map(item => (
            <li key={item.id} className="autoboy-dash-nav-item">
              <button
                className={`autoboy-dash-nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileSidebarOpen(false);
                }}
              >
                <FontAwesomeIcon icon={item.icon} className="autoboy-dash-nav-icon" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Upgrade to Premium Card */}
        <div style={{
          margin: '1.5rem 1rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
        }}>
          <FontAwesomeIcon
            icon={faCrown}
            style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: '#FCD34D' }}
          />
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: 'white'
          }}>
            Go Premium!
          </h3>
          <p style={{
            fontSize: '0.85rem',
            marginBottom: '1rem',
            opacity: '0.95',
            lineHeight: '1.4'
          }}>
            Unlock advanced analytics, priority support, and exclusive seller tools.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              background: 'white',
              color: '#16A34A',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <FontAwesomeIcon icon={faRocket} />
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="autoboy-dash-mobile-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="autoboy-dash-main">
        {/* Header */}
        <div className="autoboy-dash-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="autoboy-dash-mobile-toggle"
              onClick={toggleMobileSidebar}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <h1 className="autoboy-dash-title">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
          </div>
          <div className="autoboy-dash-header-actions">
            {/* Notifications */}
            <div className="autoboy-dash-notification-wrapper">
              <button
                className="autoboy-dash-notification-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                }}
              >
                <FontAwesomeIcon icon={faBell} />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="autoboy-dash-notification-badge">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="autoboy-dash-dropdown autoboy-dash-notifications-dropdown">
                  <div className="autoboy-dash-dropdown-header">
                    <h3>Notifications</h3>
                    <button className="autoboy-dash-mark-read-btn">Mark all as read</button>
                  </div>
                  <div className="autoboy-dash-dropdown-content">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`autoboy-dash-notification-item ${notif.unread ? 'unread' : ''}`}>
                        <div className="autoboy-dash-notification-icon">
                          <FontAwesomeIcon icon={
                            notif.type === 'order' ? faShoppingCart :
                            notif.type === 'payment' ? faDollarSign :
                            notif.type === 'alert' ? faBell :
                            faCheckCircle
                          } />
                        </div>
                        <div className="autoboy-dash-notification-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.message}</p>
                          <span>{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="autoboy-dash-dropdown-footer">
                    <button>View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button className="autoboy-dash-theme-toggle" onClick={toggleTheme}>
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>

            {/* Settings Dropdown */}
            <div className="autoboy-dash-settings-wrapper">
              <button
                className="autoboy-dash-settings-btn"
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
              >
                <FontAwesomeIcon icon={faCog} />
              </button>

              {showSettings && (
                <div className="autoboy-dash-dropdown autoboy-dash-settings-dropdown">
                  <div className="autoboy-dash-dropdown-content">
                    <button className="autoboy-dash-dropdown-item" onClick={() => setActiveSection('settings')}>
                      <FontAwesomeIcon icon={faUserCircle} />
                      <span>My Profile</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item" onClick={() => setActiveSection('settings')}>
                      <FontAwesomeIcon icon={faCog} />
                      <span>Settings</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item">
                      <FontAwesomeIcon icon={faShieldAlt} />
                      <span>Privacy & Security</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <span>Help & Support</span>
                    </button>
                    <div className="autoboy-dash-dropdown-divider"></div>
                    <button className="autoboy-dash-dropdown-item autoboy-dash-logout-btn" onClick={() => window.location.href = '/login'}>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="autoboy-dash-content-area">
          {getContentForSection()}
        </div>
      </div>

      {/* Upgrade to Premium Modal */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }} onClick={() => setShowUpgradeModal(false)}>
          <div style={{
            background: isDarkMode ? '#1F2937' : 'white',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              padding: '2rem',
              textAlign: 'center',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <FontAwesomeIcon
                icon={faCrown}
                style={{ fontSize: '4rem', color: '#FCD34D', marginBottom: '1rem' }}
              />
              <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                Upgrade to Premium Seller
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                Unlock the full potential of your business
              </p>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '2rem' }}>

              {/* Premium Benefits */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '1.5rem',
                  color: isDarkMode ? '#F3F4F6' : '#1F2937'
                }}>
                  Premium Benefits
                </h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { icon: faChartPie, title: 'Advanced Analytics', desc: 'Deep insights into sales trends, customer behavior, and product performance' },
                    { icon: faRocket, title: 'Priority Listing', desc: 'Your products appear first in search results and category pages' },
                    { icon: faStar, title: 'Premium Badge', desc: 'Stand out with a verified premium seller badge on all your listings' },
                    { icon: faGem, title: 'Exclusive Tools', desc: 'Access bulk upload, inventory management, and automation tools' },
                    { icon: faUser, title: 'VIP Support', desc: '24/7 priority customer support with dedicated account manager' },
                    { icon: faDollarSign, title: 'Lower Fees', desc: 'Reduced platform fees and exclusive promotional opportunities' }
                  ].map((benefit, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: isDarkMode ? '#374151' : '#F9FAFB',
                      borderRadius: '12px',
                      border: `2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FontAwesomeIcon icon={benefit.icon} style={{ color: 'white', fontSize: '1.25rem' }} />
                      </div>
                      <div>
                        <h4 style={{
                          fontWeight: '700',
                          fontSize: '1.05rem',
                          marginBottom: '0.35rem',
                          color: isDarkMode ? '#F3F4F6' : '#1F2937'
                        }}>
                          {benefit.title}
                        </h4>
                        <p style={{
                          fontSize: '0.9rem',
                          color: isDarkMode ? '#D1D5DB' : '#6B7280',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                  Premium Membership
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'white', fontSize: '3rem', fontWeight: '800' }}>₦15,000</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>/month</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  or ₦150,000/year (Save 17%)
                </p>
                <button style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#16A34A',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem'
                }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    // TODO: Navigate to payment page
                    setToast({ message: 'Premium upgrade feature coming soon! Contact support@autoboy.com for early access.', type: 'info' });
                  }}
                >
                  <FontAwesomeIcon icon={faRocket} />
                  Upgrade to Premium
                </button>
              </div>

              <p style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                margin: 0
              }}>
                Cancel anytime. No hidden fees. 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SellerDashboard;