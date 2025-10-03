import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faBox, faShoppingCart, faDollarSign, faChartLine, faCog,
  faBars, faMoon, faSun, faPlus, faTruck, faChartPie, faMobileAlt,
  faCheckCircle, faNairaSign, faEdit, faEye, faTrash, faFilter,
  faSearch, faUpload, faSave, faUser, faEnvelope, faPhone, faMapMarkerAlt,
  faTimes, faCheck, faClipboardList, faWallet, faBell, faSignOutAlt,
  faUserCircle, faShieldAlt, faQuestionCircle
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
  Filler,
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
  BarElement,
  Filler
);

const SellerDashboard = () => {
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
  const [stats, setStats] = useState({
    activeProducts: 24,
    pendingOrders: 5,
    totalSales: 152,
    totalEarnings: 2500000
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

  // Notifications data
  const [notifications] = useState([
    { id: 1, title: 'New Order Received', message: 'Order #1234 for iPhone 15 Pro Max', time: '5 min ago', unread: true, type: 'order' },
    { id: 2, title: 'Payment Received', message: '₦1,200,000 credited to your account', time: '1 hour ago', unread: true, type: 'payment' },
    { id: 3, title: 'Product Low Stock', message: 'MacBook Pro M3 - Only 2 left', time: '3 hours ago', unread: false, type: 'alert' },
    { id: 4, title: 'New Review', message: 'Customer rated your product 5 stars', time: '1 day ago', unread: false, type: 'review' }
  ]);

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
    alert('Product added successfully!');
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
    </div>
    </>
  );
};

export default SellerDashboard;