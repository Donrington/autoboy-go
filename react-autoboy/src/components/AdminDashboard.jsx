import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar, faUsers, faCog, faBars, faMoon, faSun, faShieldAlt,
  faUserShield, faCheckCircle, faNairaSign, faEye, faFilter, faSearch,
  faUser, faTimes, faBell, faExclamationTriangle, faDollarSign, faGavel,
  faServer, faFileAlt, faUserCog, faBan, faEnvelope, faPhone, faLock,
  faChartLine, faMoneyBillWave, faCreditCard, faHistory, faDatabase,
  faMicrochip, faEdit, faTrash, faPlus,
  faDownload, faUpload, faSync, faUserTie, faUserCheck, faUserTimes,
  faFlag, faComment, faImage, faVideo, faStar, faExchangeAlt, faSignOutAlt,
  faUserCircle, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { format, subDays, subHours } from 'date-fns';
import CustomCursor from './CustomCursor';
import lightLogo from '../assets/autoboy_logo2.png';
import darkLogo from '../assets/autoboy_logo3.png';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('autoboyDarkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Notifications data
  const [notifications] = useState([
    { id: 1, title: 'System Alert', message: 'High memory usage detected - 85%', time: '2 min ago', unread: true, type: 'system' },
    { id: 2, title: 'New Report', message: 'User reported fraudulent listing', time: '15 min ago', unread: true, type: 'report' },
    { id: 3, title: 'Payment Issue', message: 'Payment gateway timeout occurred', time: '1 hour ago', unread: false, type: 'payment' },
    { id: 4, title: 'New Admin', message: 'Staff admin account created', time: '3 hours ago', unread: false, type: 'user' }
  ]);

  // Dashboard Stats
  const [stats] = useState({
    totalUsers: 45230,
    activeListings: 12450,
    pendingReports: 23,
    todayRevenue: 8500000,
    totalTransactions: 3420,
    activeSessions: 1523,
    systemHealth: 98.5,
    storageUsed: 67
  });

  // Management Data
  const [admins] = useState([
    { id: 1, name: 'John Doe', email: 'john@autoboy.com', role: 'Super Admin', status: 'active', lastActive: new Date() },
    { id: 2, name: 'Jane Smith', email: 'jane@autoboy.com', role: 'Staff Admin', status: 'active', lastActive: subHours(new Date(), 2) },
    { id: 3, name: 'Mike Johnson', email: 'mike@autoboy.com', role: 'Moderator', status: 'active', lastActive: subHours(new Date(), 5) },
    { id: 4, name: 'Sarah Williams', email: 'sarah@autoboy.com', role: 'Support Admin', status: 'inactive', lastActive: subDays(new Date(), 2) }
  ]);

  const [users] = useState([
    { id: 1, name: 'Ahmed Musa', email: 'ahmed@example.com', type: 'Seller', status: 'active', joined: subDays(new Date(), 120), totalSpent: 2500000, listings: 45 },
    { id: 2, name: 'Chioma Okafor', email: 'chioma@example.com', type: 'Buyer', status: 'active', joined: subDays(new Date(), 60), totalSpent: 1200000, listings: 0 },
    { id: 3, name: 'Ibrahim Yusuf', email: 'ibrahim@example.com', type: 'Premium Seller', status: 'suspended', joined: subDays(new Date(), 200), totalSpent: 5000000, listings: 120 }
  ]);

  // Moderation Data
  const [reports] = useState([
    { id: 1, type: 'Product', reportedItem: 'iPhone 15 Listing', reporter: 'user@example.com', reason: 'Suspected Fraud', status: 'pending', date: subHours(new Date(), 2) },
    { id: 2, type: 'User', reportedItem: 'Ahmed Seller', reporter: 'buyer@example.com', reason: 'Inappropriate Behavior', status: 'reviewing', date: subHours(new Date(), 5) },
    { id: 3, type: 'Comment', reportedItem: 'Review on Product #123', reporter: 'seller@example.com', reason: 'Spam', status: 'resolved', date: subDays(new Date(), 1) }
  ]);

  // Transaction Data
  const [transactions] = useState([
    { id: '#TXN-001', buyer: 'Chioma Okafor', seller: 'Ahmed Musa', product: 'iPhone 15 Pro Max', amount: 1200000, fee: 60000, status: 'completed', date: new Date() },
    { id: '#TXN-002', buyer: 'Ibrahim Yusuf', seller: 'Tech Store', product: 'MacBook Pro M3', amount: 2500000, fee: 125000, status: 'processing', date: subHours(new Date(), 3) },
    { id: '#TXN-003', buyer: 'Sarah Johnson', seller: 'Mobile Hub', product: 'Samsung Galaxy S24', amount: 950000, fee: 47500, status: 'failed', date: subHours(new Date(), 6) }
  ]);

  // Disputes Data
  const [disputes] = useState([
    { id: '#DIS-001', buyer: 'Chioma Okafor', seller: 'Ahmed Musa', product: 'iPhone 15', amount: 1200000, reason: 'Item not as described', status: 'open', priority: 'high', date: subHours(new Date(), 12) },
    { id: '#DIS-002', buyer: 'Ibrahim Yusuf', seller: 'Tech Store', product: 'MacBook Pro', amount: 2500000, reason: 'Delivery delay', status: 'investigating', priority: 'medium', date: subDays(new Date(), 1) },
    { id: '#DIS-003', buyer: 'Sarah Johnson', seller: 'Mobile Hub', product: 'Galaxy S24', amount: 950000, reason: 'Wrong item received', status: 'resolved', priority: 'low', date: subDays(new Date(), 3) }
  ]);

  // System Health Data
  const [systemMetrics] = useState({
    cpu: 45,
    memory: 62,
    storage: 67,
    bandwidth: 54,
    apiLatency: 120,
    uptime: 99.8,
    activeConnections: 1523,
    queuedJobs: 45
  });

  const [systemLogs] = useState([
    { id: 1, type: 'info', message: 'Database backup completed successfully', timestamp: subHours(new Date(), 1) },
    { id: 2, type: 'warning', message: 'High memory usage detected (85%)', timestamp: subHours(new Date(), 2) },
    { id: 3, type: 'error', message: 'Payment gateway timeout - retrying', timestamp: subHours(new Date(), 4) },
    { id: 4, type: 'info', message: 'Scheduled maintenance completed', timestamp: subHours(new Date(), 6) }
  ]);

  // Analytics Data
  const [analyticsData] = useState({
    newUsers: { today: 234, week: 1520, month: 6840 },
    revenue: { today: 8500000, week: 52000000, month: 215000000 },
    transactions: { today: 342, week: 2450, month: 10230 },
    topCategories: [
      { name: 'Mobile Phones', sales: 4520, revenue: 125000000 },
      { name: 'Laptops', sales: 1240, revenue: 85000000 },
      { name: 'Accessories', sales: 6780, revenue: 45000000 }
    ],
    topSellers: [
      { name: 'Tech Store Lagos', sales: 342, revenue: 25000000 },
      { name: 'Mobile Hub', sales: 287, revenue: 18000000 },
      { name: 'Gadget World', sales: 234, revenue: 15000000 }
    ]
  });

  useEffect(() => {
    document.body.className = isDarkMode ? 'autoboy-dash-dark-mode' : '';
    localStorage.setItem('autoboyDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  const getStatusColor = (status) => {
    const colors = {
      active: '#22c55e', inactive: '#6b7280', suspended: '#ef4444',
      completed: '#22c55e', processing: '#f59e0b', failed: '#ef4444',
      pending: '#f59e0b', reviewing: '#3b82f6', resolved: '#22c55e',
      open: '#ef4444', investigating: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    return colors[priority] || '#6b7280';
  };

  const getLogTypeColor = (type) => {
    const colors = { info: '#3b82f6', warning: '#f59e0b', error: '#ef4444', success: '#22c55e' };
    return colors[type] || '#6b7280';
  };

  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-stats autoboy-admin-stats-grid">
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faUsers} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="autoboy-dash-stat-label">Total Users</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faChartLine} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.activeListings.toLocaleString()}</div>
          <div className="autoboy-dash-stat-label">Active Listings</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faExclamationTriangle} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.pendingReports}</div>
          <div className="autoboy-dash-stat-label">Pending Reports</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faNairaSign} /></div></div>
          <div className="autoboy-dash-stat-value">{formatCurrency(stats.todayRevenue)}</div>
          <div className="autoboy-dash-stat-label">Today's Revenue</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faExchangeAlt} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.totalTransactions.toLocaleString()}</div>
          <div className="autoboy-dash-stat-label">Total Transactions</div>
        </div>
        <div className="autoboy-dash-stat-card">
          <div className="autoboy-dash-stat-header"><div className="autoboy-dash-stat-icon"><FontAwesomeIcon icon={faServer} /></div></div>
          <div className="autoboy-dash-stat-value">{stats.systemHealth}%</div>
          <div className="autoboy-dash-stat-label">System Health</div>
        </div>
      </div>

      <div className="autoboy-dash-content autoboy-admin-dashboard-grid">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Recent Activity</h2>
          </div>
          <div className="autoboy-dash-section-content">
            {systemLogs.slice(0, 4).map(log => (
              <div key={log.id} className="autoboy-admin-activity-item">
                <div className="autoboy-admin-activity-icon" style={{ background: getLogTypeColor(log.type) }}>
                  <FontAwesomeIcon icon={log.type === 'error' ? faExclamationTriangle : log.type === 'warning' ? faBell : faCheckCircle} />
                </div>
                <div className="autoboy-admin-activity-info">
                  <p>{log.message}</p>
                  <span>{format(log.timestamp, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">Pending Reports</h2>
            <button className="autoboy-dash-btn autoboy-dash-btn-primary" onClick={() => setActiveSection('moderation')}>View All</button>
          </div>
          <div className="autoboy-dash-section-content">
            {reports.filter(r => r.status === 'pending').map(report => (
              <div key={report.id} className="autoboy-admin-report-item">
                <div>
                  <h4>{report.reportedItem}</h4>
                  <p>{report.reason}</p>
                  <span className="autoboy-admin-report-meta">Reported by {report.reporter}</span>
                </div>
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Management Content
  const renderManagementContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-admin-management-tabs">
        <button className="autoboy-admin-tab-btn active">Admins</button>
        <button className="autoboy-admin-tab-btn">Users</button>
        <button className="autoboy-admin-tab-btn">Roles & Permissions</button>
      </div>

      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Admin Management</h2>
          <button className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faPlus} /> Add Admin</button>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td><strong>{admin.name}</strong></td>
                    <td>{admin.email}</td>
                    <td><span className="autoboy-admin-role-badge">{admin.role}</span></td>
                    <td><span className="autoboy-dash-status-badge" style={{ backgroundColor: getStatusColor(admin.status) }}>{admin.status}</span></td>
                    <td>{format(admin.lastActive, 'MMM dd, yyyy HH:mm')}</td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="autoboy-dash-action-btn autoboy-dash-action-btn-danger"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">User Management</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter</button>
            <div className="autoboy-dash-search">
              <FontAwesomeIcon icon={faSearch} />
              <input type="text" placeholder="Search users..." />
            </div>
          </div>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Joined</th><th>Total Spent</th><th>Listings</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.type}</td>
                    <td><span className="autoboy-dash-status-badge" style={{ backgroundColor: getStatusColor(user.status) }}>{user.status}</span></td>
                    <td>{format(user.joined, 'MMM dd, yyyy')}</td>
                    <td>{formatCurrency(user.totalSpent)}</td>
                    <td>{user.listings}</td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="autoboy-dash-action-btn autoboy-dash-action-btn-danger"><FontAwesomeIcon icon={faBan} /></button>
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

  // Moderation Content
  const renderModerationContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Reports & Moderation</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter by Status</button>
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter by Type</button>
          </div>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr><th>Type</th><th>Reported Item</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td><span className="autoboy-admin-type-badge">{report.type}</span></td>
                    <td><strong>{report.reportedItem}</strong></td>
                    <td>{report.reporter}</td>
                    <td>{report.reason}</td>
                    <td><span className="autoboy-dash-status-badge" style={{ backgroundColor: getStatusColor(report.status) }}>{report.status}</span></td>
                    <td>{format(report.date, 'MMM dd, yyyy HH:mm')}</td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faCheckCircle} /></button>
                        <button className="autoboy-dash-action-btn autoboy-dash-action-btn-danger"><FontAwesomeIcon icon={faTimes} /></button>
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

  // Transactions Content
  const renderTransactionsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">All Transactions</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faDownload} /> Export</button>
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter</button>
            <div className="autoboy-dash-search">
              <FontAwesomeIcon icon={faSearch} />
              <input type="text" placeholder="Search transactions..." />
            </div>
          </div>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr><th>Transaction ID</th><th>Buyer</th><th>Seller</th><th>Product</th><th>Amount</th><th>Fee</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id}>
                    <td><code>{txn.id}</code></td>
                    <td>{txn.buyer}</td>
                    <td>{txn.seller}</td>
                    <td>{txn.product}</td>
                    <td><strong>{formatCurrency(txn.amount)}</strong></td>
                    <td>{formatCurrency(txn.fee)}</td>
                    <td><span className="autoboy-dash-status-badge" style={{ backgroundColor: getStatusColor(txn.status) }}>{txn.status}</span></td>
                    <td>{format(txn.date, 'MMM dd, yyyy HH:mm')}</td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faDownload} /></button>
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

  // Analytics Content
  const renderAnalyticsContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-admin-analytics-cards">
        <div className="autoboy-admin-analytics-card">
          <h3>New Users</h3>
          <div className="autoboy-admin-analytics-stats">
            <div><span>Today</span><strong>{analyticsData.newUsers.today}</strong></div>
            <div><span>This Week</span><strong>{analyticsData.newUsers.week}</strong></div>
            <div><span>This Month</span><strong>{analyticsData.newUsers.month}</strong></div>
          </div>
        </div>
        <div className="autoboy-admin-analytics-card">
          <h3>Revenue</h3>
          <div className="autoboy-admin-analytics-stats">
            <div><span>Today</span><strong>{formatCurrency(analyticsData.revenue.today)}</strong></div>
            <div><span>This Week</span><strong>{formatCurrency(analyticsData.revenue.week)}</strong></div>
            <div><span>This Month</span><strong>{formatCurrency(analyticsData.revenue.month)}</strong></div>
          </div>
        </div>
        <div className="autoboy-admin-analytics-card">
          <h3>Transactions</h3>
          <div className="autoboy-admin-analytics-stats">
            <div><span>Today</span><strong>{analyticsData.transactions.today}</strong></div>
            <div><span>This Week</span><strong>{analyticsData.transactions.week}</strong></div>
            <div><span>This Month</span><strong>{analyticsData.transactions.month}</strong></div>
          </div>
        </div>
      </div>

      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Top Categories</h2></div>
          <div className="autoboy-dash-section-content">
            {analyticsData.topCategories.map((cat, idx) => (
              <div key={idx} className="autoboy-admin-analytics-item">
                <div>
                  <h4>{cat.name}</h4>
                  <p>{cat.sales} sales</p>
                </div>
                <div className="autoboy-admin-analytics-value">{formatCurrency(cat.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Top Sellers</h2></div>
          <div className="autoboy-dash-section-content">
            {analyticsData.topSellers.map((seller, idx) => (
              <div key={idx} className="autoboy-admin-analytics-item">
                <div>
                  <h4>{seller.name}</h4>
                  <p>{seller.sales} sales</p>
                </div>
                <div className="autoboy-admin-analytics-value">{formatCurrency(seller.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Disputes Content
  const renderDisputesContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Dispute Management</h2>
          <div className="autoboy-dash-filters">
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter by Priority</button>
            <button className="autoboy-dash-filter-btn"><FontAwesomeIcon icon={faFilter} /> Filter by Status</button>
          </div>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-dash-table-container">
            <table className="autoboy-dash-table">
              <thead>
                <tr><th>Dispute ID</th><th>Buyer</th><th>Seller</th><th>Product</th><th>Amount</th><th>Reason</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {disputes.map(dispute => (
                  <tr key={dispute.id}>
                    <td><code>{dispute.id}</code></td>
                    <td>{dispute.buyer}</td>
                    <td>{dispute.seller}</td>
                    <td>{dispute.product}</td>
                    <td><strong>{formatCurrency(dispute.amount)}</strong></td>
                    <td>{dispute.reason}</td>
                    <td><span className="autoboy-admin-priority-badge" style={{ backgroundColor: getPriorityColor(dispute.priority) }}>{dispute.priority}</span></td>
                    <td><span className="autoboy-dash-status-badge" style={{ backgroundColor: getStatusColor(dispute.status) }}>{dispute.status}</span></td>
                    <td>{format(dispute.date, 'MMM dd, yyyy HH:mm')}</td>
                    <td>
                      <div className="autoboy-dash-actions">
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
                        <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faGavel} /></button>
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

  // System Health Content
  const renderSystemHealthContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-admin-system-metrics">
        <div className="autoboy-admin-metric-card">
          <div className="autoboy-admin-metric-header">
            <FontAwesomeIcon icon={faMicrochip} />
            <h3>CPU Usage</h3>
          </div>
          <div className="autoboy-admin-metric-value">{systemMetrics.cpu}%</div>
          <div className="autoboy-admin-progress-bar">
            <div className="autoboy-admin-progress-fill" style={{ width: `${systemMetrics.cpu}%`, backgroundColor: systemMetrics.cpu > 80 ? '#ef4444' : '#22c55e' }}></div>
          </div>
        </div>
        <div className="autoboy-admin-metric-card">
          <div className="autoboy-admin-metric-header">
            <FontAwesomeIcon icon={faDatabase} />
            <h3>Memory</h3>
          </div>
          <div className="autoboy-admin-metric-value">{systemMetrics.memory}%</div>
          <div className="autoboy-admin-progress-bar">
            <div className="autoboy-admin-progress-fill" style={{ width: `${systemMetrics.memory}%`, backgroundColor: systemMetrics.memory > 80 ? '#ef4444' : '#22c55e' }}></div>
          </div>
        </div>
        <div className="autoboy-admin-metric-card">
          <div className="autoboy-admin-metric-header">
            <FontAwesomeIcon icon={faServer} />
            <h3>Storage</h3>
          </div>
          <div className="autoboy-admin-metric-value">{systemMetrics.storage}%</div>
          <div className="autoboy-admin-progress-bar">
            <div className="autoboy-admin-progress-fill" style={{ width: `${systemMetrics.storage}%`, backgroundColor: systemMetrics.storage > 80 ? '#ef4444' : '#22c55e' }}></div>
          </div>
        </div>
        <div className="autoboy-admin-metric-card">
          <div className="autoboy-admin-metric-header">
            <FontAwesomeIcon icon={faChartLine} />
            <h3>Bandwidth</h3>
          </div>
          <div className="autoboy-admin-metric-value">{systemMetrics.bandwidth}%</div>
          <div className="autoboy-admin-progress-bar">
            <div className="autoboy-admin-progress-fill" style={{ width: `${systemMetrics.bandwidth}%`, backgroundColor: systemMetrics.bandwidth > 80 ? '#ef4444' : '#22c55e' }}></div>
          </div>
        </div>
      </div>

      <div className="autoboy-dash-content">
        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header">
            <h2 className="autoboy-dash-section-title">System Status</h2>
            <button className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faSync} /> Refresh</button>
          </div>
          <div className="autoboy-dash-section-content">
            <div className="autoboy-admin-status-grid">
              <div className="autoboy-admin-status-item">
                <span>API Latency</span>
                <strong style={{ color: '#22c55e' }}>{systemMetrics.apiLatency}ms</strong>
              </div>
              <div className="autoboy-admin-status-item">
                <span>Uptime</span>
                <strong style={{ color: '#22c55e' }}>{systemMetrics.uptime}%</strong>
              </div>
              <div className="autoboy-admin-status-item">
                <span>Active Connections</span>
                <strong>{systemMetrics.activeConnections}</strong>
              </div>
              <div className="autoboy-admin-status-item">
                <span>Queued Jobs</span>
                <strong>{systemMetrics.queuedJobs}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">System Logs</h2></div>
          <div className="autoboy-dash-section-content">
            {systemLogs.map(log => (
              <div key={log.id} className="autoboy-admin-log-item">
                <span className="autoboy-admin-log-type" style={{ backgroundColor: getLogTypeColor(log.type) }}>{log.type}</span>
                <div className="autoboy-admin-log-content">
                  <p>{log.message}</p>
                  <span>{format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // CMS Content
  const renderCMSContent = () => (
    <div className="autoboy-dash-content-wrapper">
      <div className="autoboy-admin-cms-tabs">
        <button className="autoboy-admin-tab-btn active">Pages</button>
        <button className="autoboy-admin-tab-btn">Blog Posts</button>
        <button className="autoboy-admin-tab-btn">Categories</button>
        <button className="autoboy-admin-tab-btn">Media</button>
      </div>

      <div className="autoboy-dash-section" style={{ gridColumn: '1 / -1' }}>
        <div className="autoboy-dash-section-header">
          <h2 className="autoboy-dash-section-title">Content Management</h2>
          <button className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faPlus} /> Add New</button>
        </div>
        <div className="autoboy-dash-section-content">
          <div className="autoboy-admin-cms-grid">
            <div className="autoboy-admin-cms-card">
              <div className="autoboy-admin-cms-icon"><FontAwesomeIcon icon={faFileAlt} /></div>
              <h4>About Us</h4>
              <p>Last updated: {format(subDays(new Date(), 5), 'MMM dd, yyyy')}</p>
              <div className="autoboy-admin-cms-actions">
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">Edit</button>
                <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
              </div>
            </div>
            <div className="autoboy-admin-cms-card">
              <div className="autoboy-admin-cms-icon"><FontAwesomeIcon icon={faFileAlt} /></div>
              <h4>Terms of Service</h4>
              <p>Last updated: {format(subDays(new Date(), 12), 'MMM dd, yyyy')}</p>
              <div className="autoboy-admin-cms-actions">
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">Edit</button>
                <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
              </div>
            </div>
            <div className="autoboy-admin-cms-card">
              <div className="autoboy-admin-cms-icon"><FontAwesomeIcon icon={faFileAlt} /></div>
              <h4>Privacy Policy</h4>
              <p>Last updated: {format(subDays(new Date(), 8), 'MMM dd, yyyy')}</p>
              <div className="autoboy-admin-cms-actions">
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">Edit</button>
                <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
              </div>
            </div>
            <div className="autoboy-admin-cms-card">
              <div className="autoboy-admin-cms-icon"><FontAwesomeIcon icon={faFileAlt} /></div>
              <h4>FAQ</h4>
              <p>Last updated: {format(subDays(new Date(), 3), 'MMM dd, yyyy')}</p>
              <div className="autoboy-admin-cms-actions">
                <button className="autoboy-dash-btn autoboy-dash-btn-primary">Edit</button>
                <button className="autoboy-dash-action-btn"><FontAwesomeIcon icon={faEye} /></button>
              </div>
            </div>
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
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">General Settings</h2></div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form">
              <div className="autoboy-dash-form-group"><label>Site Name</label><input type="text" defaultValue="AutoBoy" /></div>
              <div className="autoboy-dash-form-group"><label>Support Email</label><input type="email" defaultValue="support@autoboy.com" /></div>
              <div className="autoboy-dash-form-group"><label>Support Phone</label><input type="tel" defaultValue="+234 800 123 4567" /></div>
              <div className="autoboy-dash-form-group"><label>Maintenance Mode</label>
                <div className="autoboy-dash-checkbox-label">
                  <input type="checkbox" />
                  <span>Enable maintenance mode</span>
                </div>
              </div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faCheckCircle} /> Save Changes</button>
            </form>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Payment Settings</h2></div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form">
              <div className="autoboy-dash-form-group"><label>Transaction Fee (%)</label><input type="number" defaultValue="5" step="0.1" /></div>
              <div className="autoboy-dash-form-group"><label>Minimum Transaction Amount</label><input type="number" defaultValue="1000" /></div>
              <div className="autoboy-dash-form-group"><label>Payment Gateway</label>
                <select><option>Paystack</option><option>Flutterwave</option><option>Stripe</option></select>
              </div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faCheckCircle} /> Save Changes</button>
            </form>
          </div>
        </div>

        <div className="autoboy-dash-section">
          <div className="autoboy-dash-section-header"><h2 className="autoboy-dash-section-title">Security Settings</h2></div>
          <div className="autoboy-dash-section-content">
            <form className="autoboy-dash-settings-form">
              <div className="autoboy-dash-form-group">
                <label>Two-Factor Authentication</label>
                <div className="autoboy-dash-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Require 2FA for all admins</span>
                </div>
              </div>
              <div className="autoboy-dash-form-group">
                <label>Session Timeout (minutes)</label>
                <input type="number" defaultValue="30" />
              </div>
              <div className="autoboy-dash-form-group">
                <label>IP Whitelist</label>
                <textarea rows="3" placeholder="Enter allowed IP addresses (one per line)"></textarea>
              </div>
              <button type="submit" className="autoboy-dash-btn autoboy-dash-btn-primary"><FontAwesomeIcon icon={faCheckCircle} /> Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const getContentForSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboardContent();
      case 'management': return renderManagementContent();
      case 'moderation': return renderModerationContent();
      case 'transactions': return renderTransactionsContent();
      case 'analytics': return renderAnalyticsContent();
      case 'disputes': return renderDisputesContent();
      case 'system-health': return renderSystemHealthContent();
      case 'cms': return renderCMSContent();
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
            <div className="autoboy-dash-profile-avatar"><FontAwesomeIcon icon={faUserShield} /></div>
            <div className="autoboy-dash-profile-info">
              <h3 className="autoboy-dash-seller-name">Admin Panel</h3>
              <p className="autoboy-dash-seller-status">Super Administrator</p>
            </div>
          </div>

          <ul className="autoboy-dash-nav">
            {[
              { id: 'dashboard', icon: faChartBar, label: 'Dashboard' },
              { id: 'management', icon: faUsers, label: 'Management' },
              { id: 'moderation', icon: faShieldAlt, label: 'Moderation' },
              { id: 'transactions', icon: faExchangeAlt, label: 'Transactions' },
              { id: 'analytics', icon: faChartLine, label: 'Analytics' },
              { id: 'disputes', icon: faGavel, label: 'Disputes' },
              { id: 'system-health', icon: faServer, label: 'System Health' },
              { id: 'cms', icon: faFileAlt, label: 'CMS' },
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
                            notif.type === 'system' ? faServer :
                            notif.type === 'report' ? faExclamationTriangle :
                            notif.type === 'payment' ? faDollarSign :
                            faUserShield
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
                      <span>Admin Profile</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item" onClick={() => setActiveSection('system-health')}>
                      <FontAwesomeIcon icon={faServer} />
                      <span>System Health</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item" onClick={() => setActiveSection('settings')}>
                      <FontAwesomeIcon icon={faCog} />
                      <span>Settings</span>
                    </button>
                    <button className="autoboy-dash-dropdown-item">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <span>Documentation</span>
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

export default AdminDashboard;
