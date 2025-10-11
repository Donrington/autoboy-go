// API Configuration for Go Backend Integration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Client with interceptors and error handling
class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Generic request method with error handling and retry logic
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');

      let data = null;
      if (hasJsonContent) {
        try {
          data = await response.json();
        } catch (e) {
          // JSON parse error - response body might be empty
          data = null;
        }
      }

      if (!response.ok) {
        // Extract error message from backend response
        const errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw this.handleError(error);
    }
  }

  // Get authentication headers (JWT token from localStorage)
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Error handler for consistent error formatting
  handleError(error) {
    if (error.name === 'AbortError') {
      return new Error('Request timeout');
    }

    if (error.message.includes('404')) {
      return new Error('Resource not found');
    }

    if (error.message.includes('401') || error.message.includes('Invalid or expired token')) {
      // Handle unauthorized access - but don't redirect immediately
      // Let the component handle it gracefully
      const authError = new Error('Invalid or expired token');
      authError.isAuthError = true;
      return authError;
    }

    return error;
  }

  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API client instance
const apiClient = new APIClient();

// Products API Service
export const productsAPI = {
  // Get all products with filters and pagination
  getAll: (params = {}) => apiClient.get('/products', params),
  
  // Get featured/trending products for homepage
  getFeatured: () => apiClient.get('/products', { featured: true }),
  
  // Get product by ID
  getById: (id) => apiClient.get(`/products/${id}`),
  
  // Search products
  search: (query, filters = {}) => apiClient.get('/products', { 
    search: query, 
    ...filters 
  }),
  
  // Get products by category
  getByCategory: (categoryId, params = {}) => apiClient.get('/products', { category_id: categoryId, ...params }),
  
  // Add to wishlist
  addToWishlist: (productId) => apiClient.post('/user/wishlist', { product_id: productId }),
  
  // Remove from wishlist
  removeFromWishlist: (productId) => apiClient.delete(`/user/wishlist/${productId}`),
};

// Categories API Service
export const categoriesAPI = {
  // Get all categories
  getAll: () => apiClient.get('/categories'),
  
  // Get category by ID
  getById: (id) => apiClient.get(`/categories/${id}`),
  
  // Get category with products
  getWithProducts: (id, params = {}) => apiClient.get('/products', { category_id: id, ...params }),
};

// Cart API Service
export const cartAPI = {
  // Get cart items
  getItems: () => apiClient.get('/cart'),
  
  // Add item to cart
  addItem: (productId, quantity = 1) => apiClient.post('/cart/add', {
    product_id: productId,
    quantity,
  }),
  
  // Update cart item quantity
  updateItem: (itemId, quantity) => apiClient.put('/cart/update', {
    item_id: itemId,
    quantity,
  }),
  
  // Remove item from cart
  removeItem: (itemId) => apiClient.delete(`/cart/remove/${itemId}`),
  
  // Clear cart
  clear: () => apiClient.delete('/cart/clear'),
};

// User API Service
export const userAPI = {
  // Get user profile
  getProfile: () => apiClient.get('/user/profile'),
  
  // Update user profile
  updateProfile: (data) => apiClient.put('/user/profile', data),
  
  // Get user orders
  getOrders: (params = {}) => apiClient.get('/user/orders', params),
  
  // Get user wishlist
  getWishlist: () => apiClient.get('/user/wishlist'),
  
  // Get user addresses
  getAddresses: () => apiClient.get('/user/addresses'),
  
  // Add user address
  addAddress: (addressData) => apiClient.post('/user/addresses', addressData),
  
  // Update user address
  updateAddress: (addressId, addressData) => apiClient.put(`/user/addresses/${addressId}`, addressData),
  
  // Delete user address
  deleteAddress: (addressId) => apiClient.delete(`/user/addresses/${addressId}`),
  
  // Change password
  changePassword: (passwordData) => apiClient.post('/user/change-password', passwordData),
};

// Authentication API Service
export const authAPI = {
  // User login
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // User registration
  register: (userData) => apiClient.post('/auth/register', userData),

  // User logout
  logout: () => apiClient.post('/user/logout'),

  // Send email verification (after registration)
  sendEmailVerification: (email) => apiClient.post('/auth/send-email-verification', { email }),

  // Resend email verification
  resendEmailVerification: (email) => apiClient.post('/auth/resend-email-verification', { email }),

  // Verify email with token
  verifyEmail: (token) => apiClient.get(`/auth/verify-email?token=${token}`),

  // Verify phone
  verifyPhone: (phoneData) => apiClient.post('/user/verify-phone', phoneData),
};

// Orders API Service
export const ordersAPI = {
  // Create order
  create: (orderData) => apiClient.post('/orders', orderData),
  
  // Get order by ID
  getById: (orderId) => apiClient.get(`/user/orders/${orderId}`),
  
  // Get user orders
  getUserOrders: (params = {}) => apiClient.get('/user/orders', params),
  
  // Cancel order
  cancel: (orderId) => apiClient.post(`/user/orders/${orderId}/cancel`),
  
  // Track order
  track: (orderId) => apiClient.get(`/orders/${orderId}/track`),
};

// Seller API Service
export const sellerAPI = {
  // Get seller dashboard data
  getDashboard: () => apiClient.get('/seller/dashboard'),

  // Get seller sales analytics
  getSalesAnalytics: () => apiClient.get('/seller/analytics/sales'),

  // Get seller product analytics
  getProductAnalytics: () => apiClient.get('/seller/analytics/products'),

  // Get seller revenue analytics
  getRevenueAnalytics: () => apiClient.get('/seller/analytics/revenue'),

  // Get seller profile
  getProfile: () => apiClient.get('/seller/profile'),

  // Update seller profile
  updateProfile: (profileData) => apiClient.put('/seller/profile', profileData),

  // Get seller products
  getProducts: (params = {}) => apiClient.get('/seller/products', params),

  // Add seller product
  addProduct: (productData) => apiClient.post('/seller/products', productData),

  // Update seller product
  updateProduct: (productId, productData) => apiClient.put(`/seller/products/${productId}`, productData),

  // Delete seller product
  deleteProduct: (productId) => apiClient.delete(`/seller/products/${productId}`),

  // Get seller orders
  getOrders: (params = {}) => apiClient.get('/seller/orders', params),

  // Get seller order by ID
  getOrder: (orderId) => apiClient.get(`/seller/orders/${orderId}`),

  // Update order status
  updateOrderStatus: (orderId, status) => apiClient.put(`/seller/orders/${orderId}/status`, { status }),
};

// Buyer API Service
export const buyerAPI = {
  // Get buyer dashboard data
  getDashboard: () => apiClient.get('/buyer/dashboard'),

  // Get buyer recent activity
  getRecentActivity: () => apiClient.get('/buyer/recent-activity'),
};

// Notifications API Service
export const notificationsAPI = {
  // Get user notifications
  getNotifications: () => apiClient.get('/notifications'),

  // Mark notification as read
  markAsRead: (notificationId) => apiClient.put(`/notifications/${notificationId}/read`),

  // Delete notification
  delete: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),

  // Get notification preferences
  getPreferences: () => apiClient.get('/notifications/preferences'),

  // Update notification preferences
  updatePreferences: (preferences) => apiClient.post('/notifications/preferences', preferences),
};

// Activity API Service
export const activityAPI = {
  // Get user activity
  getUserActivity: () => apiClient.get('/user/activity'),
};

// Wallet API Service
export const walletAPI = {
  // Get wallet balance
  getBalance: () => apiClient.get('/wallet/balance'),

  // Get wallet transactions history
  getTransactions: () => apiClient.get('/wallet/transactions'),

  // Request withdrawal
  requestWithdrawal: (withdrawalData) => apiClient.post('/wallet/withdraw', withdrawalData),
};

// Payment API Service (handled within order creation)
export const paymentAPI = {
  // Initialize payment (integrated with order creation)
  initialize: (paymentData) => apiClient.post('/orders', paymentData),

  // Verify payment status
  verify: (orderId) => apiClient.get(`/orders/${orderId}/track`),
};

// Utility function to handle API responses with loading states
export const withLoadingState = async (apiCall, setLoading) => {
  try {
    setLoading(true);
    const result = await apiCall();
    return result;
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};

// Utility function to handle API errors with user feedback
export const handleAPIError = (error, showNotification = null) => {
  console.error('API Error:', error);
  
  if (showNotification) {
    showNotification({
      type: 'error',
      message: error.message || 'An unexpected error occurred',
    });
  }
  
  return error;
};

// Export API client for direct usage if needed
export default apiClient;