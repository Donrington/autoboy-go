import { useState, useEffect } from 'react';
import '../assets/css/styles.css';
import '../assets/css/cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Samsung Galaxy S24 Ultra",
      description: "256 GB Phantom Black",
      price: 1850000,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      name: "MacBook Pro 16\"",
      description: "M3 Max, 1TB SSD, Space Black",
      price: 4200000,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60"
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedForLater, setSavedForLater] = useState([]);

  const shippingCost = 50000;
  const taxRate = 0.075; // 7.5% VAT

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      setCartItems(items => items.filter(item => item.id !== id));
    }
  };

  const saveForLater = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      setSavedForLater(prev => [...prev, item]);
      setCartItems(items => items.filter(item => item.id !== id));
    }
  };

  const moveToCart = (id) => {
    const item = savedForLater.find(item => item.id === id);
    if (item) {
      setCartItems(prev => [...prev, item]);
      setSavedForLater(items => items.filter(item => item.id !== id));
    }
  };

  const removeSavedItem = (id) => {
    setSavedForLater(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    const validPromoCodes = {
      'SAVE10': { discount: 0.1, type: 'percentage', description: '10% off' },
      'WELCOME': { discount: 100000, type: 'fixed', description: '₦100,000 off' },
      'FREESHIP': { discount: 0, type: 'shipping', description: 'Free shipping' }
    };

    if (validPromoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        ...validPromoCodes[promoCode.toUpperCase()]
      });
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    const subtotal = calculateSubtotal();

    switch (appliedPromo.type) {
      case 'percentage':
        return subtotal * appliedPromo.discount;
      case 'fixed':
        return Math.min(appliedPromo.discount, subtotal);
      default:
        return 0;
    }
  };

  const calculateShipping = () => {
    if (appliedPromo && appliedPromo.type === 'shipping') return 0;
    return cartItems.length > 0 ? shippingCost : 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal() - calculateDiscount();
    return Math.round(subtotal * taxRate);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal - discount + shipping + tax;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleProceedToCheckout = async () => {
    setIsLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      console.log('Proceeding to checkout with:', {
        items: cartItems,
        total: calculateTotal(),
        promoCode: appliedPromo
      });
      setIsLoading(false);
      alert('Redirecting to secure checkout...');
    }, 2000);
  };

  const handleContinueShopping = () => {
    window.location.href = '/shop';
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty-state">
            <div className="cart-empty-icon">
              <i className="fas fa-shopping-cart fa-4x"></i>
            </div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-description">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button className="cart-continue-shopping-btn" onClick={handleContinueShopping}>
              <i className="fas fa-shopping-bag"></i>
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>Shopping Cart</span>
        </div>

        {/* Page Title */}
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart</p>
        </div>

        {/* Main Grid */}
        <div className="cart-main-grid">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-content">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-description">{item.description}</p>
                        <div className="cart-item-price-mobile">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-quantity-controls">
                          <button
                            className="cart-quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <span className="cart-quantity-value">{item.quantity}</span>
                          <button
                            className="cart-quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>

                        <div className="cart-item-secondary-actions">
                          <button
                            className="cart-save-later-btn"
                            onClick={() => saveForLater(item.id)}
                            title="Save for later"
                          >
                            <i className="fas fa-heart"></i>
                          </button>

                          <button
                            className="cart-remove-btn"
                            onClick={() => removeItem(item.id)}
                            title="Remove item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cart-item-price-desktop">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Section */}
            <div className="cart-promo-section">
              <h3>Promo Code</h3>
              {appliedPromo ? (
                <div className="applied-promo">
                  <div className="applied-promo-info">
                    <i className="fas fa-tag"></i>
                    <span>Code: {appliedPromo.code}</span>
                    <span className="promo-description">({appliedPromo.description})</span>
                  </div>
                  <button className="remove-promo-btn" onClick={removePromoCode}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div className="promo-input-group">
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button className="promo-apply-btn" onClick={applyPromoCode}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>

            <div className="cart-summary-content">
              <div className="cart-total-row">
                <span className="cart-total-label">Subtotal ({getTotalItems()} items)</span>
                <span className="cart-total-value">{formatPrice(calculateSubtotal())}</span>
              </div>

              {appliedPromo && (
                <div className="cart-total-row discount-row">
                  <span className="cart-total-label">
                    Discount ({appliedPromo.code})
                  </span>
                  <span className="cart-total-value discount">
                    -{formatPrice(calculateDiscount())}
                  </span>
                </div>
              )}

              <div className="cart-total-row">
                <span className="cart-total-label">Shipping</span>
                <span className="cart-total-value">
                  {calculateShipping() === 0 ? 'Free' : formatPrice(calculateShipping())}
                </span>
              </div>

              <div className="cart-total-row">
                <span className="cart-total-label">Tax (VAT 7.5%)</span>
                <span className="cart-total-value">{formatPrice(calculateTax())}</span>
              </div>

              <div className="cart-total-row cart-final-total">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-value">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <div className="cart-summary-actions">
              <button
                className="cart-checkout-btn"
                onClick={handleProceedToCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock"></i>
                    Secure Checkout
                  </>
                )}
              </button>

              <button className="cart-continue-shopping-btn" onClick={handleContinueShopping}>
                <i className="fas fa-arrow-left"></i>
                Continue Shopping
              </button>
            </div>

            {/* Security Badge */}
            <div className="cart-security-badge">
              <i className="fas fa-shield-alt"></i>
              <span>Secure SSL encryption</span>
            </div>
          </div>
        </div>

        {/* Saved for Later Section */}
        {savedForLater.length > 0 && (
          <div className="cart-saved-items-section">
            <h3 className="saved-items-title">
              <i className="fas fa-heart"></i>
              Saved for Later ({savedForLater.length} items)
            </h3>
            <div className="saved-items-list">
              {savedForLater.map((item) => (
                <div key={`saved-${item.id}`} className="saved-item">
                  <div className="saved-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="saved-item-details">
                    <h4 className="saved-item-name">{item.name}</h4>
                    <p className="saved-item-description">{item.description}</p>
                    <div className="saved-item-price">{formatPrice(item.price)}</div>
                  </div>
                  <div className="saved-item-actions">
                    <button
                      className="move-to-cart-btn"
                      onClick={() => moveToCart(item.id)}
                    >
                      <i className="fas fa-shopping-cart"></i>
                      Move to Cart
                    </button>
                    <button
                      className="remove-saved-btn"
                      onClick={() => removeSavedItem(item.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        <div className="cart-recently-viewed">
          <h3>You might also like</h3>
          <div className="recently-viewed-items">
            <div className="recently-viewed-item">
              <img src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&auto=format&fit=crop&q=60" alt="Product" />
              <h4>iPhone 15 Pro</h4>
              <span>{formatPrice(1200000)}</span>
            </div>
            <div className="recently-viewed-item">
              <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=60" alt="Product" />
              <h4>OnePlus 12</h4>
              <span>{formatPrice(650000)}</span>
            </div>
            <div className="recently-viewed-item">
              <img src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&auto=format&fit=crop&q=60" alt="Product" />
              <h4>iPad Pro</h4>
              <span>{formatPrice(800000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;