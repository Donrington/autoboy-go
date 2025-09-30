import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faShoppingCart, faCog, faBars, faMoon, faSun, faTruck,
  faMobileAlt, faCheckCircle, faNairaSign, faEye, faFilter, faSearch,
  faUser, faTimes, faHeart, faBell, faHistory, faMapMarked, faStar,
  faExchangeAlt, faShoppingBag, faBox, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { format, subDays } from 'date-fns';
import CustomCursor from './CustomCursor';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('autoboyDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [stats] = useState({
    activeOrders: 3,
    completedOrders: 12,
    wishlistItems: 18,
    totalSpent: 1850000
  });

  const [wishlist] = useState([
    { id: 1, name: 'iPhone 15 Pro Max', price: 1200000, seller: 'Tech Store Lagos', condition: 'Brand New', image: '/api/placeholder/80/80', available: true },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 950000, seller: 'Mobile Hub', condition: 'UK Used', image: '/api/placeholder/80/80', available: true },
    { id: 3, name: 'MacBook Pro M3', price: 2500000, seller: 'Apple Premium', condition: 'Brand New', image: '/api/placeholder/80/80', available: false }
  ]);

  const [orders] = useState([
    { id: '#ORD-001', seller: 'Tech Store Lagos', product: 'iPhone 15 Pro Max', amount: 1200000, status: 'shipped', date: new Date(), trackingNumber: 'TRK123456789' },
    { id: '#ORD-002', seller: 'Mobile Hub', product: 'Samsung Galaxy S24', amount: 950000, status: 'processing', date: subDays(new Date(), 1), trackingNumber: null },
    { id: '#ORD-003', seller: 'Gadget World', product: 'AirPods Pro', amount: 180000, status: 'delivered', date: subDays(new Date(), 7), trackingNumber: 'TRK987654321' }
  ]);

  const [savedSearches] = useState([
    { id: 1, query: 'iPhone 15 Pro Max Lagos', results: 24, lastChecked: '2 hours ago' },
    { id: 2, query: 'Samsung Galaxy S24 UK Used', results: 18, lastChecked: '1 day ago' },
    { id: 3, query: 'MacBook Pro M3 Nigeria', results: 12, lastChecked: '3 days ago' }
  ]);

  const [recentActivity] = useState([
    { id: 1, action: 'Ordered', item: 'iPhone 15 Pro Max', time: '2 hours ago', icon: faShoppingCart },
    { id: 2, action: 'Added to wishlist', item: 'MacBook Pro M3', time: '5 hours ago', icon: faHeart },
    { id: 3, action: 'Reviewed', item: 'AirPods Pro', time: '1 day ago', icon: faStar },
    { id: 4, action: 'Received delivery', item: 'Samsung Charger', time: '2 days ago', icon: faTruck }
  ]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'autoboy-dash-dark-mode' : '';
    localStorage.setItem('autoboyDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  const getStatusColor = (status) => {
    const colors = { processing: '#f59e0b', shipped: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444' };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = { processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
    return texts[status] || status;
  };

  const renderDashboardContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-quick-actions">
        <button className="autoboy-dash-quick-action" onClick={() => setActiveSection('orders')}>
          <div className="autoboy-dash-quick-action-icon"><FontAwesomeIcon icon={faShoppingCart} /></div>
          <div><h3>My Orders</h3><p>Track your purchases</p></div>
        </button>
        <button className="autoboy-dash-quick-action" onClick={() => setActiveSection('wishlist')}>
          <div className="autoboy-dash-quick-action-icon"><FontAwesomeIcon icon={faHeart} /></div>
          <div><h3>Wishlist</h3><p>Saved items</p></div>
        </button>
        <button className="autoboy-dash-quick-action" onClick={() => setActiveSection('activity')}>
          <div className="autoboy-dash-quick-action-icon"><FontAwesomeIcon icon={faHistory} /></div>
          <div><h3>Activity</h3><p>Recent actions</p></div>
        </button>
      </div>

      <div className="autoboy-dash-stats">
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faShoppingCart} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.activeOrders}</div>
          <div className="autoboy-dash-stat-label">Active Orders</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faCheckCircle} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.completedOrders}</div>
          <div className="autoboy-dash-stat-label">Completed</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faHeart} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.wishlistItems}</div>
          <div className="autoboy-dash-stat-label">Wishlist Items</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faNairaSign} /></div></div>
          <div className="autoboy-dash-stat-value">{formatCurrency(stats.totalSpent)}</div>
          <div className="autoboy-dash-stat-label">Total Spent</div>
        </div>
      </div>

      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Recent Orders</h2></div>
          <div className="autoboy-dash-section-content">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="autoboy-dash-order-item">
                <div className="autoboy-dash-order-info">
                  <h4>{order.product}</h4>
                  <p>{order.seller}</p>
                  <span className="autoboy-dash-order-id">{order.id}</span>
                </div>
                <div className="autoboy-dash-order-details">
                  <div className="autoboy-dash-order-amount">{formatCurrency(order.amount)}</div>
                  <div className="autoboy-dash-order-status" style={{ color: getStatusColor(order.status) }}>
                    {getStatusText(order.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Recent Activity</h2></div>
          <div className="autoboy-dash-section-content">
            {recentActivity.map(activity => (
              <div key={activity.id} className="autoboy-buyer-activity-item">
                <div className="autoboy-buyer-activity-icon"><FontAwesomeIcon icon={activity.icon} /></div>
                <div className="autoboy-buyer-activity-info">
                  <p><strong>{activity.action}</strong> {activity.item}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">My Orders</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter</button>
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
                <tr><th>Order ID</th><th>Product</th><th>Seller</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.seller}</td>
                    <td>{formatCurrency(order.amount)}</td>
                    <td>{format(order.date, 'MMM dd, yyyy')}</td>
                    <td><span className="autoboy-dash-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>{getStatusText(order.status)}</span></td>
                    <td><div className="autoboy-dash-actions"><button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWishlistContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">My Wishlist</h2>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-buyer-wishlist-grid">
            {wishlist.map(item => (
              <div key={item.id} className="autoboy-buyer-wishlist-card">
                <div className="autoboy-buyer-wishlist-image"><img src={item.image} alt={item.name} /></div>
                <div className="autoboy-buyer-wishlist-info">
                  <h4>{item.name}</h4>
                  <p className="autoboy-buyer-wishlist-seller">{item.seller}</p>
                  <p className="autoboy-buyer-wishlist-condition">{item.condition}</p>
                  <div className="autoboy-buyer-wishlist-price">{formatCurrency(item.price)}</div>
                  <div className="autoboy-buyer-wishlist-actions">
                    <button className="autoboy-dash-btn autoboy-dash-btn-primary" disabled={!item.available}>
                      {item.available ? 'Buy Now' : 'Out of Stock'}
                    </button>
                    <button className="autoboy-dash-action-btn autoboy-dash-action-btn-danger"><FontAwesomeIcon icon={faTimes} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSavedSearchesContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Saved Searches</h2></div>
        <div className="autoboy-dash-section-content">
          {savedSearches.map(search => (
            <div key={search.id} className="autoboy-buyer-search-item">
              <div className="autoboy-buyer-search-info">
                <h4><FontAwesomeIcon icon={faSearch} /> {search.query}</h4>
                <p>{search.results} results • Last checked {search.lastChecked}</p>
              </div>
              <div className="autoboy-buyer-search-actions">
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">View Results</button>
                <button className="autoboy-dash-action-btn autoboy-dash-action-btn-danger"><FontAwesomeIcon icon={faTimes} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Recent Activity</h2></div>
        <div className="autoboy-dash-section-content">
          {recentActivity.map(activity => (
            <div key={activity.id} className="autoboy-buyer-activity-item-large">
              <div className="autoboy-buyer-activity-icon-large"><FontAwesomeIcon icon={activity.icon} /></div>
              <div className="autoboy-buyer-activity-info-large">
                <h4>{activity.action}</h4>
                <p>{activity.item}</p>
                <span>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Profile Settings</h2></div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form">
              <div className="autoboy-dash-form-group"><label>Full Name</label><input type="text" defaultValue="John Doe" /></div>
              <div className="autoboy-dash-form-group"><label>Email</label><input type="email" defaultValue="john@example.com" /></div>
              <div className="autoboy-dash-form-group"><label>Phone</label><input type="tel" defaultValue="+234 812 345 6789" /></div>
              <div className="autoboy-dash-form-group"><label>Delivery Address</label><textarea rows="3" defaultValue="123 Main Street, Ikeja, Lagos"></textarea></div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faStar} /> Save Changes</button>
            </form>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Notification Settings</h2></div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-notification-settings">
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" defaultChecked />Email notifications for order updates</label></div>
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" defaultChecked />SMS notifications for delivery</label></div>
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" />Price drop alerts for wishlist items</label></div>
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" defaultChecked />New product recommendations</label></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getContentForSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboardContent();
      case 'orders': return renderOrdersContent();
      case 'wishlist': return renderWishlistContent();
      case 'saved-searches': return renderSavedSearchesContent();
      case 'activity': return renderActivityContent();
      case 'settings': return renderSettingsContent();
      default: return renderDashboardContent();
    }
  };

  return (
    <>
      <CustomCursor />
      <div className="autoboy-dash-container">
        <div className={`autoboy-dash-sidebar ${isMobileSidebarOpen ? 'autoboy-dash-sidebar-open' : ''}`}>
          <div className="autoboy-dash-logo"><img src={isDarkMode ? darkLogo : lightLogo} alt="AutoBoy" /></div>
          <div className="autoboy-dash-profile">
            <div className="autoboy-dash-profile-avatar"><FontAwesomeIcon icon={faUser} /></div>
            <div className="autoboy-dash-profile-info">
              <h3 className="autoboy-dash-seller-name">John Doe</h3>
              <p className="autoboy-dash-seller-status">Buyer Account</p>
            </div>
          </div>

          <ul className="autoboy-dash-nav">
            {[
              { id: 'dashboard', icon: faChartBar, label: 'Dashboard' },
              { id: 'orders', icon: faShoppingCart, label: 'My Orders' },
              { id: 'wishlist', icon: faHeart, label: 'Wishlist' },
              { id: 'saved-searches', icon: faSearch, label: 'Saved Searches' },
              { id: 'activity', icon: faHistory, label: 'Activity' },
              { id: 'settings', icon: faCog, label: 'Settings' }
            ].map(item => (
              <li key={item.id} className="autoboy-dash-nav-item">
                <button className={`autoboy-dash-nav-link ${activeSection === item.id ? 'active' : ''}`} onClick={() => { setActiveSection(item.id); setIsMobileSidebarOpen(false); }}>
                  <FontAwesomeIcon icon={item.icon} className="autoboy-dash-nav-icon" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {isMobileSidebarOpen && <div className="autoboy-dash-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />}

        <div className="autoboy-dash-main">
          <div className="autoboy-dash-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="autoboy-dash-mobile-toggle" onClick={toggleMobileSidebar}><FontAwesomeIcon icon={faBars} /></button>
              <h1 className="autoboy-dash-title">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}</h1>
            </div>
            <div className="autoboy-dash-header-actions">
              <button className="autoboy-dash-theme-toggle" onClick={toggleTheme}><FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} /></button>
            </div>
          </div>

          <div className="autoboy-dash-content-area">{getContentForSection()}</div>
        </div>
      </div>
    </>
  );
};

export default BuyerDashboard;
