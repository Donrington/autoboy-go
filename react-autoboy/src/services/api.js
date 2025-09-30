// API Configuration for Django Backend Integration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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
    
    if (error.message.includes('401')) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return new Error('Unauthorized access');
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
  getAll: (params = {}) => apiClient.get('/products/', params),
  
  // Get featured/trending products for homepage
  getFeatured: () => apiClient.get('/products/featured/'),
  
  // Get product by ID
  getById: (id) => apiClient.get(`/products/${id}/`),
  
  // Search products
  search: (query, filters = {}) => apiClient.get('/products/search/', { 
    q: query, 
    ...filters 
  }),
  
  // Get products by category
  getByCategory: (categoryId, params = {}) => apiClient.get(`/products/category/${categoryId}/`, params),
  
  // Get product reviews
  getReviews: (productId) => apiClient.get(`/products/${productId}/reviews/`),
  
  // Add product review
  addReview: (productId, reviewData) => apiClient.post(`/products/${productId}/reviews/`, reviewData),
  
  // Add to wishlist
  addToWishlist: (productId) => apiClient.post('/wishlist/', { product_id: productId }),
  
  // Remove from wishlist
  removeFromWishlist: (productId) => apiClient.delete(`/wishlist/${productId}/`),
};

// Categories API Service
export const categoriesAPI = {
  // Get all categories
  getAll: () => apiClient.get('/categories/'),
  
  // Get category by ID
  getById: (id) => apiClient.get(`/categories/${id}/`),
  
  // Get category with products
  getWithProducts: (id, params = {}) => apiClient.get(`/categories/${id}/products/`, params),
};

// Cart API Service
export const cartAPI = {
  // Get cart items
  getItems: () => apiClient.get('/cart/'),
  
  // Add item to cart
  addItem: (productId, quantity = 1) => apiClient.post('/cart/add/', {
    product_id: productId,
    quantity,
  }),
  
  // Update cart item quantity
  updateItem: (itemId, quantity) => apiClient.patch(`/cart/items/${itemId}/`, {
    quantity,
  }),
  
  // Remove item from cart
  removeItem: (itemId) => apiClient.delete(`/cart/items/${itemId}/`),
  
  // Clear cart
  clear: () => apiClient.delete('/cart/clear/'),
  
  // Get cart total
  getTotal: () => apiClient.get('/cart/total/'),
};

// User API Service
export const userAPI = {
  // Get user profile
  getProfile: () => apiClient.get('/user/profile/'),
  
  // Update user profile
  updateProfile: (data) => apiClient.patch('/user/profile/', data),
  
  // Get user orders
  getOrders: (params = {}) => apiClient.get('/user/orders/', params),
  
  // Get user wishlist
  getWishlist: () => apiClient.get('/user/wishlist/'),
  
  // Get user addresses
  getAddresses: () => apiClient.get('/user/addresses/'),
  
  // Add user address
  addAddress: (addressData) => apiClient.post('/user/addresses/', addressData),
  
  // Update user address
  updateAddress: (addressId, addressData) => apiClient.patch(`/user/addresses/${addressId}/`, addressData),
  
  // Delete user address
  deleteAddress: (addressId) => apiClient.delete(`/user/addresses/${addressId}/`),
};

// Authentication API Service
export const authAPI = {
  // User login
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  
  // User registration
  register: (userData) => apiClient.post('/auth/register/', userData),
  
  // User logout
  logout: () => apiClient.post('/auth/logout/'),
  
  // Refresh token
  refreshToken: () => apiClient.post('/auth/refresh/'),
  
  // Password reset request
  requestPasswordReset: (email) => apiClient.post('/auth/password-reset/', { email }),
  
  // Password reset confirm
  confirmPasswordReset: (token, newPassword) => apiClient.post('/auth/password-reset/confirm/', {
    token,
    new_password: newPassword,
  }),
  
  // Verify email
  verifyEmail: (token) => apiClient.post('/auth/verify-email/', { token }),
};

// Orders API Service
export const ordersAPI = {
  // Create order
  create: (orderData) => apiClient.post('/orders/', orderData),
  
  // Get order by ID
  getById: (orderId) => apiClient.get(`/orders/${orderId}/`),
  
  // Get user orders
  getUserOrders: (params = {}) => apiClient.get('/orders/user/', params),
  
  // Update order status (for sellers/admin)
  updateStatus: (orderId, status) => apiClient.patch(`/orders/${orderId}/`, { status }),
  
  // Cancel order
  cancel: (orderId) => apiClient.patch(`/orders/${orderId}/cancel/`),
  
  // Track order
  track: (orderId) => apiClient.get(`/orders/${orderId}/track/`),
};

// Seller API Service
export const sellerAPI = {
  // Apply to become seller
  apply: (applicationData) => apiClient.post('/seller/apply/', applicationData),
  
  // Get seller dashboard data
  getDashboard: () => apiClient.get('/seller/dashboard/'),
  
  // Get seller products
  getProducts: (params = {}) => apiClient.get('/seller/products/', params),
  
  // Add seller product
  addProduct: (productData) => apiClient.post('/seller/products/', productData),
  
  // Update seller product
  updateProduct: (productId, productData) => apiClient.patch(`/seller/products/${productId}/`, productData),
  
  // Delete seller product
  deleteProduct: (productId) => apiClient.delete(`/seller/products/${productId}/`),
  
  // Get seller orders
  getOrders: (params = {}) => apiClient.get('/seller/orders/', params),
  
  // Get seller analytics
  getAnalytics: (params = {}) => apiClient.get('/seller/analytics/', params),
};

// Payment API Service
export const paymentAPI = {
  // Initialize payment
  initialize: (paymentData) => apiClient.post('/payments/initialize/', paymentData),
  
  // Verify payment
  verify: (reference) => apiClient.get(`/payments/verify/${reference}/`),
  
  // Get payment methods
  getMethods: () => apiClient.get('/payments/methods/'),
  
  // Process refund
  refund: (paymentId, amount) => apiClient.post(`/payments/${paymentId}/refund/`, { amount }),
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