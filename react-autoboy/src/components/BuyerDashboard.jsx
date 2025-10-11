import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faShoppingCart, faCog, faBars, faMoon, faSun, faTruck,
  faMobileAlt, faCheckCircle, faNairaSign, faEye, faFilter, faSearch,
  faUser, faTimes, faHeart, faBell, faHistory, faMapMarked, faStar,
  faExchangeAlt, faShoppingBag, faBox, faChartLine, faSignOutAlt,
  faUserCircle, faQuestionCircle, faShieldAlt, faHome, faWallet
} from '@fortawesome/free-solid-svg-icons';
import { format, subDays } from 'date-fns';
import CustomCursor from './CustomCursor';
import Toast from './Toast';
import { userAPI, buyerAPI, notificationsAPI, activityAPI, walletAPI } from '../services/api';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('autoboyDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Notifications data - now from API
  const [notifications, setNotifications] = useState([]);

  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
    totalSpent: 0
  });

  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

  const [savedSearches] = useState([
    { id: 1, query: 'iPhone 15 Pro Max Lagos', results: 24, lastChecked: '2 hours ago' },
    { id: 2, query: 'Samsung Galaxy S24 UK Used', results: 18, lastChecked: '1 day ago' },
    { id: 3, query: 'MacBook Pro M3 Nigeria', results: 12, lastChecked: '3 days ago' }
  ]);

  // Recent activity - now from API
  const [recentActivity, setRecentActivity] = useState([]);

  // Wallet data
  const [walletBalance, setWalletBalance] = useState({
    balance: 0,
    currency: 'NGN'
  });

  useEffect(() => {
    document.body.className = isDarkMode ? 'autoboy-dash-dark-mode' : '';
    localStorage.setItem('autoboyDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Fetch all buyer data
  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile
        const profileResponse = await userAPI.getProfile();
        if (profileResponse && profileResponse.data) {
          setUserProfile(profileResponse.data);
        }

        // Fetch buyer dashboard stats from dedicated endpoint
        const dashboardResponse = await buyerAPI.getDashboard();
        if (dashboardResponse && dashboardResponse.data) {
          setStats({
            activeOrders: dashboardResponse.data.active_orders || 0,
            completedOrders: dashboardResponse.data.completed_orders || 0,
            wishlistItems: dashboardResponse.data.wishlist_count || 0,
            totalSpent: dashboardResponse.data.total_spent || 0
          });
        }

        // Fetch orders for order history display
        const ordersResponse = await userAPI.getOrders();
        if (ordersResponse && ordersResponse.data) {
          setOrders(ordersResponse.data.orders || []);
        }

        // Fetch wishlist for wishlist display
        const wishlistResponse = await userAPI.getWishlist();
        if (wishlistResponse && wishlistResponse.data) {
          setWishlist(wishlistResponse.data.items || []);
        }

        // Fetch notifications
        const notificationsResponse = await notificationsAPI.getNotifications();
        if (notificationsResponse && notificationsResponse.data) {
          const notifList = notificationsResponse.data.notifications || notificationsResponse.data || [];
          setNotifications(notifList.slice(0, 10)); // Show last 10
        }

        // Fetch recent activity
        const activityResponse = await buyerAPI.getRecentActivity();
        if (activityResponse && activityResponse.data) {
          const recentOrders = activityResponse.data.recent_orders || [];
          // Map orders to activity format
          const activityList = recentOrders.map(order => ({
            id: order._id || order.id,
            action: getActivityAction(order.status),
            item: order.product_title || order.product_name || 'Product',
            time: formatActivityTime(order.created_at || order.updated_at),
            icon: getActivityIcon(order.status)
          }));
          setRecentActivity(activityList.slice(0, 10)); // Show last 10
        }

        // Fetch wallet balance
        const walletResponse = await walletAPI.getBalance();
        if (walletResponse && walletResponse.data) {
          setWalletBalance({
            balance: walletResponse.data.balance || 0,
            currency: walletResponse.data.currency || 'NGN'
          });
        }

      } catch (error) {
        console.error('Error fetching buyer data:', error);
        // Graceful degradation - continue with empty/default data
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyerData();
  }, []);

  // Helper functions for activity mapping
  const getActivityAction = (status) => {
    const actions = {
      pending: 'Ordered',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Received delivery',
      cancelled: 'Cancelled'
    };
    return actions[status] || 'Ordered';
  };

  const getActivityIcon = (status) => {
    const icons = {
      pending: faShoppingCart,
      processing: faBox,
      shipped: faTruck,
      delivered: faCheckCircle,
      cancelled: faTimes
    };
    return icons[status] || faShoppingCart;
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return format(date, 'MMM d');
  };

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
        <div className="autoboy-dash-stat-card" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: 'white' }}>
          <div className="autoboy-dash-stat-header">
            <div className="autoboy-dash-stat-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
              <FontAwesomeIcon icon={faWallet} />
            </div>
          </div>
          <div className="autoboy-dash-stat-value" style={{ color: 'white' }}>{formatCurrency(walletBalance.balance)}</div>
          <div className="autoboy-dash-stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Wallet Balance</div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.9 }}>
            Refunds & rewards
          </p>
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
              <div className="autoboy-dash-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={userProfile ? `${userProfile.profile?.first_name || ''} ${userProfile.profile?.last_name || ''}`.trim() : ''}
                  onChange={() => {}}
                />
              </div>
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="autoboy-dash-container">
        <div className={`autoboy-dash-sidebar ${isMobileSidebarOpen ? 'autoboy-dash-sidebar-open' : ''}`}>
          <div className="autoboy-dash-logo"><img src={isDarkMode ? darkLogo : lightLogo} alt="AutoBoy" /></div>
          <div className="autoboy-dash-profile">
            <div className="autoboy-dash-profile-avatar"><FontAwesomeIcon icon={faUser} /></div>
            <div className="autoboy-dash-profile-info">
              <h3 className="autoboy-dash-seller-name">
              {userProfile ? `${userProfile.profile?.first_name || ''} ${userProfile.profile?.last_name || ''}`.trim() || 'User' : 'Loading...'}
            </h3>
              <p className="autoboy-dash-seller-status">Buyer Account</p>
            </div>
          </div>

          <ul className="autoboy-dash-nav">
            {/* Homepage Link */}
            <li className="autoboy-dash-nav-item">
              <button className="autoboy-dash-nav-link" onClick={() => { navigate('/homepage'); setIsMobileSidebarOpen(false); }}>
                <FontAwesomeIcon icon={faHome} className="autoboy-dash-nav-icon" />
                Homepage
              </button>
            </li>

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
                            notif.type === 'shipping' ? faTruck :
                            notif.type === 'alert' ? faBell :
                            notif.type === 'wishlist' ? faHeart :
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

          <div className="autoboy-dash-content-area">{getContentForSection()}</div>
        </div>
      </div>
    </>
  );
};

export default BuyerDashboard;
