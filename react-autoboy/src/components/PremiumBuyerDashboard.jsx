import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faShoppingCart, faCog, faBars, faMoon, faSun, faTruck,
  faMobileAlt, faCheckCircle, faNairaSign, faEye, faFilter, faSearch,
  faUser, faTimes, faHeart, faBell, faHistory, faMapMarked, faStar,
  faExchangeAlt, faShoppingBag, faBox, faChartLine, faCrown, faGift,
  faTag, faBolt, faEnvelope, faPhone, faHeadset, faAward, faTrophy,
  faMedal, faChartPie, faPercentage, faClock, faFire, faUsers, faComment,
  faSignOutAlt, faUserCircle, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { format, subDays, subHours } from 'date-fns';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import CustomCursor from './CustomCursor';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';
import './PremiumBuyerDashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler);

const PremiumBuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('autoboyDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Notifications data
  const [notifications] = useState([
    { id: 1, title: 'Exclusive Deal Alert', message: 'VIP-only flash sale starts in 30 minutes', time: '5 min ago', unread: true, type: 'exclusive' },
    { id: 2, title: 'Early Access', message: 'iPhone 16 Pro available for premium buyers', time: '1 hour ago', unread: true, type: 'early-access' },
    { id: 3, title: 'Price Drop', message: 'Wishlist item dropped to target price', time: '3 hours ago', unread: false, type: 'price-drop' },
    { id: 4, title: 'Reward Points', message: 'You earned 500 bonus points', time: '1 day ago', unread: false, type: 'reward' }
  ]);

  // Premium Stats
  const [stats] = useState({
    activeOrders: 5,
    completedOrders: 45,
    wishlistItems: 28,
    totalSpent: 8750000,
    totalSaved: 1250000,
    exclusiveDeals: 12,
    priorityAccess: 8,
    rewardPoints: 4500
  });

  // Analytics Data
  const [analyticsData] = useState({
    monthlySpending: [850000, 920000, 750000, 1100000, 980000, 1050000],
    categoryBreakdown: {
      'Mobile Phones': 45,
      'Laptops': 30,
      'Accessories': 15,
      'Gaming': 10
    },
    savingsTimeline: [120000, 150000, 180000, 210000, 250000, 280000],
    purchaseFrequency: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [8, 12, 9, 15, 11, 14]
    }
  });

  // Priority Listings
  const [priorityListings] = useState([
    { id: 1, name: 'iPhone 15 Pro Max (Early Access)', price: 1150000, originalPrice: 1200000, discount: 50000, seller: 'Premium Tech Store', timeLeft: '2 hours', image: '/api/placeholder/100/100', badge: 'early-access' },
    { id: 2, name: 'MacBook Pro M3 (VIP Only)', price: 2400000, originalPrice: 2600000, discount: 200000, seller: 'Apple Premium', timeLeft: '5 hours', image: '/api/placeholder/100/100', badge: 'vip-only' },
    { id: 3, name: 'Samsung Galaxy S24 Ultra', price: 900000, originalPrice: 950000, discount: 50000, seller: 'Mobile Hub Elite', timeLeft: '1 day', image: '/api/placeholder/100/100', badge: 'flash-deal' }
  ]);

  // Exclusive Deals
  const [exclusiveDeals] = useState([
    { id: 1, title: 'Flash Sale: Premium Gadgets', discount: '20-30%', validUntil: subHours(new Date(), -6), category: 'Electronics', itemsAvailable: 45 },
    { id: 2, title: 'VIP Weekend Special', discount: '15%', validUntil: subDays(new Date(), -2), category: 'All Categories', itemsAvailable: 120 },
    { id: 3, title: 'Early Bird: New Arrivals', discount: '10%', validUntil: subDays(new Date(), -5), category: 'Latest Products', itemsAvailable: 78 }
  ]);

  // Messages
  const [messages] = useState([
    { id: 1, seller: 'Tech Store Lagos', lastMessage: 'Your iPhone order has been shipped!', unread: 2, time: subHours(new Date(), 1), avatar: '/api/placeholder/40/40' },
    { id: 2, seller: 'Mobile Hub', lastMessage: 'Special discount just for you - 15% off!', unread: 1, time: subHours(new Date(), 3), avatar: '/api/placeholder/40/40' },
    { id: 3, seller: 'Gadget World', lastMessage: 'Thank you for your purchase!', unread: 0, time: subDays(new Date(), 1), avatar: '/api/placeholder/40/40' }
  ]);

  // Badge Progress
  const [badgeProgress] = useState({
    currentLevel: 'Gold Buyer',
    currentPoints: 4500,
    nextLevel: 'Platinum Buyer',
    nextLevelPoints: 6000,
    achievements: [
      { name: 'Early Adopter', description: 'First 100 premium buyers', earned: true, icon: faTrophy },
      { name: 'Big Spender', description: 'Spent over ₦5M', earned: true, icon: faCrown },
      { name: 'Deal Hunter', description: 'Used 50 exclusive deals', earned: false, icon: faGift },
      { name: 'Loyal Customer', description: '100 completed orders', earned: false, icon: faMedal }
    ],
    perks: [
      '24/7 Priority Support',
      'Free Premium Shipping',
      'Early Access to Sales',
      'Exclusive Discounts',
      'Personal Account Manager'
    ]
  });

  // Price Alerts
  const [priceAlerts] = useState([
    { id: 1, product: 'iPhone 15 Pro Max', currentPrice: 1200000, targetPrice: 1100000, status: 'active', priceChange: -5 },
    { id: 2, product: 'MacBook Pro M3', currentPrice: 2500000, targetPrice: 2300000, status: 'triggered', priceChange: -8 },
    { id: 3, product: 'AirPods Pro 2', currentPrice: 185000, targetPrice: 170000, status: 'active', priceChange: -2 }
  ]);

  useEffect(() => {
    document.body.className = isDarkMode ? 'autoboy-dash-dark-mode' : '';
    localStorage.setItem('autoboyDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  const handleMessageClick = (msg) => {
    setSelectedMessage(msg);
    setIsChatOpen(true);
  };

  const handleBackToList = () => {
    setIsChatOpen(false);
  };

  // Chart Data
  const spendingChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Spending',
      data: analyticsData.monthlySpending,
      borderColor: '#22C55E',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4
    }]
  };

  const categoryChartData = {
    labels: Object.keys(analyticsData.categoryBreakdown),
    datasets: [{
      data: Object.values(analyticsData.categoryBreakdown),
      backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  const savingsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Total Savings',
      data: analyticsData.savingsTimeline,
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: '#22C55E',
      borderWidth: 1
    }]
  };

  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-premium-buyer-header">
        <div className="autoboy-premium-buyer-badge-display">
          <FontAwesomeIcon icon={faCrown} />
          <div>
            <h2>{badgeProgress.currentLevel}</h2>
            <p>{badgeProgress.currentPoints} Points • {badgeProgress.nextLevelPoints - badgeProgress.currentPoints} to {badgeProgress.nextLevel}</p>
          </div>
        </div>
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
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faNairaSign} /></div></div>
          <div className="autoboy-dash-stat-value">{formatCurrency(stats.totalSaved)}</div>
          <div className="autoboy-dash-stat-label">Total Saved</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faGift} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.exclusiveDeals}</div>
          <div className="autoboy-dash-stat-label">Exclusive Deals</div>
        </div>
      </div>

      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Priority Listings</h2>
            <button className="autoboy-dash-btn autoboy-dash-btn-primary" onClick={() => setActiveSection('priority-listings')}>View All</button>
          </div>
          <div className="autoboy-dash-section-content">
            {priorityListings.slice(0, 2).map(item => (
              <div key={item.id} className="autoboy-premium-listing-item">
                <img src={item.image} alt={item.name} />
                <div className="autoboy-premium-listing-info">
                  <div>
                    <span className="autoboy-premium-badge">{item.badge.replace('-', ' ')}</span>
                    <h4>{item.name}</h4>
                    <p>{item.seller}</p>
                  </div>
                  <div className="autoboy-premium-listing-price">
                    <div>
                      <span className="autoboy-premium-original-price">{formatCurrency(item.originalPrice)}</span>
                      <strong>{formatCurrency(item.price)}</strong>
                    </div>
                    <span className="autoboy-premium-time-left"><FontAwesomeIcon icon={faClock} /> {item.timeLeft}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Quick Actions</h2>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-premium-quick-actions">
              <button className="autoboy-premium-action-card" onClick={() => setActiveSection('exclusive-deals')}>
                <FontAwesomeIcon icon={faFire} />
                <span>Exclusive Deals</span>
              </button>
              <button className="autoboy-premium-action-card" onClick={() => setActiveSection('messages')}>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Messages</span>
              </button>
              <button className="autoboy-premium-action-card" onClick={() => setActiveSection('analytics')}>
                <FontAwesomeIcon icon={faChartPie} />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Analytics Content
  const renderAnalyticsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Monthly Spending</h2></div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Line data={spendingChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Category Breakdown</h2></div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Savings Over Time</h2></div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-chart-container">
              <Bar data={savingsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Priority Listings Content
  const renderPriorityListingsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Priority & Early Access Listings</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter</button>
          </div>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-premium-listings-grid">
            {priorityListings.map(item => (
              <div key={item.id} className="autoboy-premium-listing-card">
                <span className="autoboy-premium-badge-corner">{item.badge.replace('-', ' ')}</span>
                <img src={item.image} alt={item.name} />
                <div className="autoboy-premium-listing-details">
                  <h4>{item.name}</h4>
                  <p>{item.seller}</p>
                  <div className="autoboy-premium-price-section">
                    <div>
                      <span className="autoboy-premium-original-price">{formatCurrency(item.originalPrice)}</span>
                      <strong>{formatCurrency(item.price)}</strong>
                      <span className="autoboy-premium-discount">Save {formatCurrency(item.discount)}</span>
                    </div>
                    <span className="autoboy-premium-time-left"><FontAwesomeIcon icon={faClock} /> {item.timeLeft} left</span>
                  </div>
                  <button className="autoboy-dash-btn autoboy-dash-btn-primary">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Messages Content
  const renderMessagesContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-premium-messages-container">
        <div className={`autoboy-premium-messages-list ${isChatOpen ? 'autoboy-premium-messages-list-hidden' : ''}`}>
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Messages</h2>
            <div className="autoboy-dash-search">
              <FontAwesomeIcon icon={faSearch} />
              <input type="text" placeholder="Search messages..." />
            </div>
          </div>
          {messages.map(msg => (
            <div key={msg.id} className="autoboy-premium-message-item" onClick={() => handleMessageClick(msg)}>
              <img src={msg.avatar} alt={msg.seller} />
              <div className="autoboy-premium-message-info">
                <div className="autoboy-premium-message-header">
                  <h4>{msg.seller}</h4>
                  <span>{format(msg.time, 'HH:mm')}</span>
                </div>
                <p>{msg.lastMessage}</p>
              </div>
              {msg.unread > 0 && <span className="autoboy-premium-unread-badge">{msg.unread}</span>}
            </div>
          ))}
        </div>

        <div className={`autoboy-premium-chat-area ${isChatOpen ? 'autoboy-premium-chat-area-open' : ''}`}>
          {selectedMessage ? (
            <>
              <div className="autoboy-premium-chat-header">
                <button className="autoboy-premium-back-btn" onClick={handleBackToList}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                <img src={selectedMessage.avatar} alt={selectedMessage.seller} />
                <h3>{selectedMessage.seller}</h3>
              </div>
              <div className="autoboy-premium-chat-messages">
                <div className="autoboy-premium-chat-message autoboy-premium-chat-message-received">
                  <p>{selectedMessage.lastMessage}</p>
                  <span>{format(selectedMessage.time, 'HH:mm')}</span>
                </div>
              </div>
              <div className="autoboy-premium-chat-input">
                <input type="text" placeholder="Type a message..." />
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">Send</button>
              </div>
            </>
          ) : (
            <div className="autoboy-premium-chat-placeholder">
              <FontAwesomeIcon icon={faComment} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Exclusive Deals Content
  const renderExclusiveDealsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Exclusive Premium Deals</h2>
        </div>
        <div className="autoboy-dash-section-content">
          {exclusiveDeals.map(deal => (
            <div key={deal.id} className="autoboy-premium-deal-card">
              <div className="autoboy-premium-deal-icon">
                <FontAwesomeIcon icon={faGift} />
              </div>
              <div className="autoboy-premium-deal-info">
                <h3>{deal.title}</h3>
                <p>{deal.category} • {deal.itemsAvailable} items available</p>
                <div className="autoboy-premium-deal-meta">
                  <span className="autoboy-premium-deal-discount">{deal.discount} OFF</span>
                  <span>Valid until {format(deal.validUntil, 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <button className="autoboy-dash-btn autoboy-dash-btn-primary">Shop Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reports Content
  const renderReportsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-premium-reports-grid">
        <div className="autoboy-premium-report-card">
          <h3>Total Spending</h3>
          <div className="autoboy-premium-report-value">{formatCurrency(stats.totalSpent)}</div>
          <p>Across {stats.completedOrders} orders</p>
        </div>
        <div className="autoboy-premium-report-card">
          <h3>Total Savings</h3>
          <div className="autoboy-premium-report-value autoboy-premium-savings">{formatCurrency(stats.totalSaved)}</div>
          <p>From premium deals</p>
        </div>
        <div className="autoboy-premium-report-card">
          <h3>Average Order</h3>
          <div className="autoboy-premium-report-value">{formatCurrency(Math.floor(stats.totalSpent / stats.completedOrders))}</div>
          <p>Per transaction</p>
        </div>
        <div className="autoboy-premium-report-card">
          <h3>Reward Points</h3>
          <div className="autoboy-premium-report-value">{stats.rewardPoints}</div>
          <p>Available to redeem</p>
        </div>
      </div>

      <div className="autoboy-dash-section" style={{ marginTop: '2rem' }}>
        <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Price Alerts</h2></div>
        <div className="autoboy-dash-section-content">
          {priceAlerts.map(alert => (
            <div key={alert.id} className="autoboy-premium-alert-item">
              <div>
                <h4>{alert.product}</h4>
                <p>Current: {formatCurrency(alert.currentPrice)} • Target: {formatCurrency(alert.targetPrice)}</p>
              </div>
              <div className="autoboy-premium-alert-status">
                <span style={{ color: alert.status === 'triggered' ? '#22c55e' : '#f59e0b' }}>
                  {alert.status === 'triggered' ? '✓ Target Reached!' : `${alert.priceChange}% away`}
                </span>
                <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faBell} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Badge Content
  const renderBadgeContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-premium-badge-overview">
        <div className="autoboy-premium-badge-main">
          <div className="autoboy-premium-badge-icon">
            <FontAwesomeIcon icon={faCrown} />
          </div>
          <h2>{badgeProgress.currentLevel}</h2>
          <div className="autoboy-premium-badge-progress">
            <div className="autoboy-premium-badge-progress-bar">
              <div className="autoboy-premium-badge-progress-fill" style={{ width: `${(badgeProgress.currentPoints / badgeProgress.nextLevelPoints) * 100}%` }}></div>
            </div>
            <p>{badgeProgress.currentPoints} / {badgeProgress.nextLevelPoints} points to {badgeProgress.nextLevel}</p>
          </div>
        </div>

        <div className="autoboy-premium-perks-list">
          <h3>Your Premium Perks</h3>
          {badgeProgress.perks.map((perk, idx) => (
            <div key={idx} className="autoboy-premium-perk-item">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="autoboy-dash-section" style={{ marginTop: '2rem' }}>
        <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Achievements</h2></div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-premium-achievements-grid">
            {badgeProgress.achievements.map((achievement, idx) => (
              <div key={idx} className={`autoboy-premium-achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                <FontAwesomeIcon icon={achievement.icon} />
                <h4>{achievement.name}</h4>
                <p>{achievement.description}</p>
                {achievement.earned ? <span className="autoboy-premium-earned-badge">Earned</span> : <span className="autoboy-premium-locked-badge">Locked</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Content
  const renderSettingsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Premium Settings</h2></div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form">
              <div className="autoboy-dash-form-group"><label>Full Name</label><input type="text" defaultValue="John Doe" /></div>
              <div className="autoboy-dash-form-group"><label>Email</label><input type="email" defaultValue="john@example.com" /></div>
              <div className="autoboy-dash-form-group"><label>Phone</label><input type="tel" defaultValue="+234 812 345 6789" /></div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faCheckCircle} /> Save Changes</button>
            </form>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Premium Notifications</h2></div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-dash-notification-settings">
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" defaultChecked />Exclusive deal alerts</label></div>
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" defaultChecked />Price drop notifications</label></div>
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" defaultChecked />Early access notifications</label></div>
              <div className="autoboy-dash-notification-item"><label><input type="checkbox" />VIP event invitations</label></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getContentForSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboardContent();
      case 'analytics': return renderAnalyticsContent();
      case 'priority-listings': return renderPriorityListingsContent();
      case 'messages': return renderMessagesContent();
      case 'exclusive-deals': return renderExclusiveDealsContent();
      case 'reports': return renderReportsContent();
      case 'badge': return renderBadgeContent();
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
            <div className="autoboy-dash-profile-avatar autoboy-premium-avatar"><FontAwesomeIcon icon={faCrown} /></div>
            <div className="autoboy-dash-profile-info">
              <h3 className="autoboy-dash-seller-name">John Doe</h3>
              <p className="autoboy-dash-seller-status autoboy-premium-status">Premium Buyer</p>
            </div>
          </div>

          <ul className="autoboy-dash-nav">
            {[
              { id: 'dashboard', icon: faChartBar, label: 'Dashboard' },
              { id: 'analytics', icon: faChartPie, label: 'Analytics' },
              { id: 'priority-listings', icon: faBolt, label: 'Priority Listings' },
              { id: 'messages', icon: faEnvelope, label: 'Messages' },
              { id: 'exclusive-deals', icon: faGift, label: 'Exclusive Deals' },
              { id: 'reports', icon: faChartLine, label: 'Reports' },
              { id: 'badge', icon: faAward, label: 'Badge & Rewards' },
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
                            notif.type === 'exclusive' ? faGift :
                            notif.type === 'early-access' ? faBolt :
                            notif.type === 'price-drop' ? faTag :
                            faStar
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
                    <button className="autoboy-dash-dropdown-item" onClick={() => setActiveSection('badge')}>
                      <FontAwesomeIcon icon={faCrown} />
                      <span>Badge & Rewards</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item" onClick={() => setActiveSection('settings')}>
                      <FontAwesomeIcon icon={faCog} />
                      <span>Settings</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <span>Premium Support</span>
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

export default PremiumBuyerDashboard;
