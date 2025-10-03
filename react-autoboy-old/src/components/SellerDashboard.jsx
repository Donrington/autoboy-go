import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faBox, faShoppingCart, faDollarSign, faChartLine, faCog,
  faBars, faMoon, faSun, faPlus, faTruck, faChartPie, faMobileAlt,
  faCheckCircle, faNairaSign, faEdit, faEye, faTrash, faFilter,
  faSearch, faUpload, faSave, faUser, faEnvelope, faPhone, faMapMarkerAlt,
  faTimes, faCheck, faClipboardList, faWallet
} from '@fortawesome/free-solid-svg-icons';
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
} from 'chart.js';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import CustomCursor from './CustomCursor';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';
import './SellerDashboard.css';

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
  BarElement
);

const SellerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('autoboyDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    activeProducts: 24,
    pendingOrders: 5,
    totalSales: 152,
    totalEarnings: 2500000
  });

  // Sample data for demo
  const [products] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 1200000,
      stock: 5,
      sold: 15,
      status: 'active',
      image: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24 Ultra',
      price: 950000,
      stock: 8,
      sold: 12,
      status: 'active',
      image: '/api/placeholder/80/80'
    },
    {
      id: 3,
      name: 'Google Pixel 8 Pro',
      price: 750000,
      stock: 0,
      sold: 8,
      status: 'out_of_stock',
      image: '/api/placeholder/80/80'
    }
  ]);

  const [orders] = useState([
    {
      id: '#ORD-001',
      customer: 'John Doe',
      product: 'iPhone 15 Pro Max',
      amount: 1200000,
      status: 'pending',
      date: new Date(),
      email: 'john@example.com'
    },
    {
      id: '#ORD-002',
      customer: 'Jane Smith',
      product: 'Samsung Galaxy S24',
      amount: 950000,
      status: 'shipped',
      date: subDays(new Date(), 1),
      email: 'jane@example.com'
    },
    {
      id: '#ORD-003',
      customer: 'Mike Johnson',
      product: 'Google Pixel 8',
      amount: 750000,
      status: 'delivered',
      date: subDays(new Date(), 3),
      email: 'mike@example.com'
    }
  ]);

  // Chart data
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (₦)',
        data: [65000, 89000, 120000, 81000, 156000, 255000, 140000],
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const categoryChartData = {
    labels: ['iPhone', 'Samsung', 'Google', 'OnePlus', 'Others'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#22C55E',
          '#16A34A',
          '#4ADE80',
          '#10B981',
          '#6B7280'
        ],
        borderWidth: 0,
      }
    ]
  };

  const monthlyEarningsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Earnings (₦)',
        data: [400000, 300000, 600000, 800000, 700000, 900000],
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

  const renderProductsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">My Products</h2>
          <button className="autoboy-dash-btn autoboy-dash-btn-primary">
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
                {products.map(product => (
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
                {orders.map(order => (
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

  const renderEarningsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-earnings-cards">
        <div className="autoboy-dash-earnings-card">
          <div className="autoboy-dash-earnings-icon">
            <FontAwesomeIcon icon={faWallet} />
          </div>
          <div className="autoboy-dash-earnings-info">
            <h3>Available Balance</h3>
            <div className="autoboy-dash-earnings-amount">{formatCurrency(850000)}</div>
          </div>
        </div>
        <div className="autoboy-dash-earnings-card">
          <div className="autoboy-dash-earnings-icon">
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
          <div className="autoboy-dash-earnings-info">
            <h3>Pending Earnings</h3>
            <div className="autoboy-dash-earnings-amount">{formatCurrency(150000)}</div>
          </div>
        </div>
        <div className="autoboy-dash-earnings-card">
          <div className="autoboy-dash-earnings-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="autoboy-dash-earnings-info">
            <h3>This Month</h3>
            <div className="autoboy-dash-earnings-amount">{formatCurrency(450000)}</div>
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
                <span>{formatCurrency(2100000)}</span>
              </div>
              <div className="autoboy-dash-breakdown-item">
                <span>Commission</span>
                <span>-{formatCurrency(210000)}</span>
              </div>
              <div className="autoboy-dash-breakdown-item">
                <span>Transaction Fees</span>
                <span>-{formatCurrency(50000)}</span>
              </div>
              <hr />
              <div className="autoboy-dash-breakdown-item autoboy-dash-breakdown-total">
                <span>Net Earnings</span>
                <span>{formatCurrency(1840000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
                <h4>Conversion Rate</h4>
                <div className="autoboy-dash-metric-value">3.2%</div>
              </div>
              <div className="autoboy-dash-metric">
                <h4>Average Order Value</h4>
                <div className="autoboy-dash-metric-value">{formatCurrency(850000)}</div>
              </div>
              <div className="autoboy-dash-metric">
                <h4>Return Rate</h4>
                <div className="autoboy-dash-metric-value">1.8%</div>
              </div>
              <div className="autoboy-dash-metric">
                <h4>Customer Satisfaction</h4>
                <div className="autoboy-dash-metric-value">4.7/5</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Profile Settings</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form">
              <div className="autoboy-dash-form-group">
                <label>Full Name</label>
                <input type="text" defaultValue="John Doe" />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Email</label>
                <input type="email" defaultValue="john@example.com" />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Phone</label>
                <input type="tel" defaultValue="+234 812 345 6789" />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Store Name</label>
                <input type="text" defaultValue="John's Electronics" />
              </div>
              <div className="autoboy-dash-form-group">
                <label>Store Description</label>
                <textarea rows="4" defaultValue="Premium mobile devices and accessories"></textarea>
              </div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary">
                <FontAwesomeIcon icon={faSave} />
                Save Changes
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
            <h3 className="autoboy-dash-seller-name">John Doe</h3>
            <p className="autoboy-dash-seller-status">Verified Seller</p>
          </div>
        </div>

        <ul className="autoboy-dash-nav">
          {[
            { id: 'dashboard', icon: faChartBar, label: 'Dashboard' },
            { id: 'products', icon: faBox, label: 'Products' },
            { id: 'orders', icon: faShoppingCart, label: 'Orders' },
            { id: 'earnings', icon: faDollarSign, label: 'Earnings' },
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
            <button className="autoboy-dash-theme-toggle" onClick={toggleTheme}>
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="autoboy-dash-content-area">
          {getContentForSection()}
        </div>
      </div>
    </div>
    </>
  );
};

export default SellerDashboard;