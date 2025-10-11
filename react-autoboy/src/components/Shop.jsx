import { useState, useEffect, useRef } from 'react';
import '../assets/css/styles.css';
import '../assets/css/shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMemories, setSelectedMemories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState([]);
  const [actualPriceRange, setActualPriceRange] = useState({ min: 0, max: 2000000 });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: 1300000,
      image: "https://images.unsplash.com/photo-1664114780064-41d0dd873e92?w=500&auto=format&fit=crop&q=60",
      brand: "apple",
      category: "brand-new",
      memory: "256 GB",
      inStock: true,
      rating: 4.8,
      reviews: 124,
      isNew: true
    },
    {
      id: 2,
      name: "Samsung A15",
      price: 230000,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60",
      brand: "samsung",
      category: "uk-used",
      memory: "128 GB",
      inStock: true,
      rating: 4.2,
      reviews: 89,
      isNew: false
    },
    {
      id: 3,
      name: "MacBook Pro 2021",
      price: 700000,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
      brand: "apple",
      category: "uk-used",
      memory: "512 GB",
      inStock: true,
      rating: 4.9,
      reviews: 203,
      isNew: false
    },
    {
      id: 4,
      name: "Google Pixel 8 Pro",
      price: 950000,
      image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop&q=60",
      brand: "google",
      category: "brand-new",
      memory: "256 GB",
      inStock: false,
      rating: 4.6,
      reviews: 156,
      isNew: true
    },
    {
      id: 5,
      name: "Xiaomi Redmi Note 13",
      price: 180000,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60",
      brand: "xiaomi",
      category: "nigerian-used",
      memory: "128 GB",
      inStock: true,
      rating: 4.3,
      reviews: 67,
      isNew: false
    },
    {
      id: 6,
      name: "OnePlus 12",
      price: 650000,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
      brand: "oneplus",
      category: "brand-new",
      memory: "256 GB",
      inStock: true,
      rating: 4.5,
      reviews: 98,
      isNew: true
    },
    {
      id: 7,
      name: "Samsung Galaxy S24 Ultra",
      price: 1150000,
      image: "https://www.pointekonline.com/wp-content/uploads/2025/01/sms938_galaxys25ultra_front_titaniumblack_5506351.png",
      brand: "samsung",
      category: "brand-new",
      memory: "512 GB",
      inStock: true,
      rating: 4.7,
      reviews: 142,
      isNew: true
    },
    {
      id: 8,
      name: "Oppo Find X6 Pro",
      price: 520000,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
      brand: "oppo",
      category: "good-deal",
      memory: "256 GB",
      inStock: false,
      rating: 4.4,
      reviews: 73,
      isNew: false
    }
  ];

  const categories = [
    { value: "brand-new", label: "Brand New" },
    { value: "uk-used", label: "UK used" },
    { value: "good-deal", label: "Good Deal" },
    { value: "nigerian-used", label: "Nigerian used" },
    { value: "swap-deal", label: "Swap Deal" },
    { value: "for-sale", label: "for sale" },
    { value: "want-to-buy", label: "want to buy" },
    { value: "random-items", label: "random items" }
  ];

  const brands = [
    "Apple", "Samsung", "Google", "Xiaomi", "Oppo", "Vivo",
    "OnePlus", "Realme", "Tecno", "Infinix", "Huawei", "Redmi"
  ];

  const memories = ["1 TB", "128 GB", "512 GB", "64 GB", "256 GB", "32 GB"];

  useEffect(() => {
    // Initialize products
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);

    // Calculate price range
    const prices = sampleProducts.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    setActualPriceRange({ min: minPrice, max: maxPrice });
    setPriceRange({ min: minPrice, max: maxPrice });
  }, []);

  useEffect(() => {
    // Filter products based on all criteria
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.some(brand =>
          product.brand.toLowerCase() === brand.toLowerCase()
        )
      );
    }

    // Memory filter
    if (selectedMemories.length > 0) {
      filtered = filtered.filter(product =>
        selectedMemories.includes(product.memory)
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.isNew - a.isNew;
        default:
          return 0; // featured - no sorting
      }
    });

    setFilteredProducts(sortedFiltered);
  }, [products, searchQuery, selectedCategories, selectedBrands, selectedMemories, priceRange, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleMemoryChange = (memory) => {
    setSelectedMemories(prev =>
      prev.includes(memory)
        ? prev.filter(m => m !== memory)
        : [...prev, memory]
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleProductClick = (productId) => {
    // TODO: Navigate to product detail page
    console.log('Navigate to product:', productId);
  };

  const handleWishlistToggle = (productId, e) => {
    e.stopPropagation();
    // TODO: Implement wishlist functionality
    console.log('Toggle wishlist for product:', productId);
  };

  const handleCompareToggle = (productId, e) => {
    e.stopPropagation();
    // TODO: Implement compare functionality
    console.log('Add to compare:', productId);
  };

  const handleAddToCart = (productId, e) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (product && product.inStock) {
      setCart(prev => {
        const existing = prev.find(item => item.id === productId);
        if (existing) {
          return prev.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      console.log('Added to cart:', product.name);
      // TODO: Show toast notification
      // TODO: Connect to backend cart API
    }
  };

  const handleSwap = (productId, e) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (product && product.inStock) {
      console.log('Initiating swap for:', product.name);
      // TODO: Navigate to swap proposal page with product details
      // TODO: Connect to backend swap API
      // For now, just log
      alert(`Swap feature coming soon for ${product.name}!\nYou'll be able to propose a swap with your own items.`);
    }
  };

  const handleBuyNow = (productId, e) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (product && product.inStock) {
      console.log('Buy now for:', product.name);
      // TODO: Navigate directly to checkout page with this product
      // TODO: Skip cart, go straight to payment
      // For now, just log
      alert(`Proceeding to checkout for ${product.name}\nPrice: ${formatPrice(product.price)}`);
    }
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedMemories([]);
    setPriceRange({ min: actualPriceRange.min, max: actualPriceRange.max });
    setSearchQuery('');
    setBrandSearchQuery('');
  };

  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  const getActiveFiltersCount = () => {
    return selectedCategories.length + selectedBrands.length + selectedMemories.length;
  };

  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  return (
    <div className="shop-page">
      {/* Shop Container */}
      <div className="autoboy-shop-container">
        {/* Breadcrumb */}
        <div className="autoboy-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>Shop</span>
        </div>

        {/* Search Bar */}
        <div className="autoboy-search-container">
          <input
            type="text"
            className="autoboy-search-input"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fas fa-search autoboy-search-icon"></i>
        </div>

        {/* Results Info and Sort */}
        <div className="autoboy-results-header">
          <div className="autoboy-results-info">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            {getActiveFiltersCount() > 0 && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                Clear Filters ({getActiveFiltersCount()})
              </button>
            )}
          </div>

          <div className="autoboy-mobile-controls">
            <button className="autoboy-mobile-filter-btn" onClick={toggleMobileFilters}>
              <i className="fas fa-filter"></i>
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="filter-badge">{getActiveFiltersCount()}</span>
              )}
            </button>
          </div>

          <div className="autoboy-sort-container">
            <select
              className="autoboy-sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Shop Layout */}
        <div className="autoboy-shop-layout">
          {/* Filters Sidebar */}
          <aside className={`autoboy-filters-sidebar ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
            <div className="autoboy-filters-header-mobile">
              <h2 className="autoboy-filters-header">Filters</h2>
              <button className="autoboy-close-filters" onClick={toggleMobileFilters}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Category Filter */}
            <div className="autoboy-filter-section">
              <h3 className="autoboy-filter-title">Category</h3>
              <div className="autoboy-checkbox-list">
                {categories.map((category) => (
                  <label key={category.value} className="autoboy-checkbox-item">
                    <input
                      type="checkbox"
                      className="autoboy-checkbox autoboy-category-checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => handleCategoryChange(category.value)}
                    />
                    <span className="autoboy-checkbox-label">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="autoboy-filter-section">
              <h3 className="autoboy-filter-title">Prices</h3>
              <div className="autoboy-price-range">
                <div className="autoboy-price-inputs">
                  <input
                    type="range"
                    min={actualPriceRange.min}
                    max={actualPriceRange.max}
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange(parseInt(e.target.value), priceRange.max)}
                    className="autoboy-price-slider"
                  />
                  <input
                    type="range"
                    min={actualPriceRange.min}
                    max={actualPriceRange.max}
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange(priceRange.min, parseInt(e.target.value))}
                    className="autoboy-price-slider"
                  />
                </div>
                <div className="autoboy-price-display">
                  <span>₦{(priceRange.min / 1000).toFixed(0)}k</span>
                  <span> - </span>
                  <span>₦{priceRange.max >= 1000000 ? (priceRange.max / 1000000).toFixed(1) + 'm' : (priceRange.max / 1000).toFixed(0) + 'k'}</span>
                </div>
              </div>
            </div>

            {/* Brands Filter */}
            <div className="autoboy-filter-section">
              <h3 className="autoboy-filter-title">Brands</h3>
              <div className="autoboy-brand-search">
                <input
                  type="text"
                  className="autoboy-brand-search-input"
                  placeholder="Search brands"
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                />
                <i className="fas fa-search autoboy-brand-search-icon"></i>
              </div>
              <div className="autoboy-checkbox-list">
                {filteredBrands.map((brand) => (
                  <label key={brand} className="autoboy-checkbox-item">
                    <input
                      type="checkbox"
                      className="autoboy-checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    <span className="autoboy-checkbox-label">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Memory Filter */}
            <div className="autoboy-filter-section">
              <h3 className="autoboy-filter-title">Memory</h3>
              <div className="autoboy-checkbox-list">
                {memories.map((memory) => (
                  <label key={memory} className="autoboy-checkbox-item">
                    <input
                      type="checkbox"
                      className="autoboy-checkbox"
                      checked={selectedMemories.includes(memory)}
                      onChange={() => handleMemoryChange(memory)}
                    />
                    <span className="autoboy-checkbox-label">{memory}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Overlay */}
          {mobileFiltersOpen && (
            <div
              className="autoboy-mobile-overlay"
              onClick={toggleMobileFilters}
            ></div>
          )}

          {/* Products Content */}
          <div className="autoboy-products-content">
            {/* Products Grid */}
            <div className="autoboy-products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`autoboy-product-card ${!product.inStock ? 'out-of-stock' : ''}`}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="autoboy-quick-actions">
                      <div
                        className="autoboy-quick-action"
                        onClick={(e) => handleWishlistToggle(product.id, e)}
                      >
                        <i className="fas fa-heart"></i>
                      </div>
                      <div
                        className="autoboy-quick-action"
                        onClick={(e) => handleCompareToggle(product.id, e)}
                      >
                        <i className="fas fa-exchange-alt"></i>
                      </div>
                    </div>

                    <div className="autoboy-product-image-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="autoboy-product-image"
                      />
                      {/* Product Badges */}
                      <div className="autoboy-product-badges">
                        {product.isNew && <span className="autoboy-badge new">New</span>}
                        {!product.inStock && <span className="autoboy-badge out-stock">Out of Stock</span>}
                      </div>
                    </div>

                    <div className="autoboy-product-info">
                      <h3 className="autoboy-product-name">{product.name}</h3>

                      {/* Stock Status */}
                      <div className="autoboy-stock-status">
                        {product.inStock ? (
                          <span className="in-stock">✓ In Stock</span>
                        ) : (
                          <span className="out-of-stock">⚠️ Out of Stock</span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="autoboy-product-rating">
                        <div className="autoboy-stars">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`${i < Math.floor(product.rating) ? 'fas' : 'far'} fa-star`}
                            ></i>
                          ))}
                        </div>
                        <span className="autoboy-rating-text">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      <div className="autoboy-product-price">
                        <span className="autoboy-product-price-currency">₦</span>
                        {product.price.toLocaleString()}
                      </div>

                      {/* Action Buttons */}
                      <div className="autoboy-product-actions">
                        {/* Add to Cart Button */}
                        <button
                          className={`autoboy-action-btn autoboy-btn-cart ${!product.inStock ? 'disabled' : ''}`}
                          onClick={(e) => handleAddToCart(product.id, e)}
                          disabled={!product.inStock}
                          title="Add to Cart"
                        >
                          <i className="fas fa-shopping-cart"></i>
                        </button>

                        {/* Swap Button */}
                        <button
                          className={`autoboy-action-btn autoboy-btn-swap ${!product.inStock ? 'disabled' : ''}`}
                          onClick={(e) => handleSwap(product.id, e)}
                          disabled={!product.inStock}
                          title="Propose Swap"
                        >
                          <i className="fas fa-exchange-alt"></i>
                        </button>

                        {/* Buy Now Button */}
                        <button
                          className={`autoboy-action-btn autoboy-btn-buy ${!product.inStock ? 'disabled' : ''}`}
                          onClick={(e) => handleBuyNow(product.id, e)}
                          disabled={!product.inStock}
                          title="Buy Now"
                        >
                          <i className="fas fa-bolt"></i>
                        </button>
                      </div>

                      {/* Out of Stock Message */}
                      {!product.inStock && (
                        <div className="autoboy-out-of-stock-message">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="autoboy-empty-state">
                  <i className="fas fa-search fa-3x"></i>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  {getActiveFiltersCount() > 0 && (
                    <button className="autoboy-btn-primary" onClick={clearAllFilters}>
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="autoboy-pagination">
              <a href="#" className="autoboy-page-btn prev">
                <i className="fas fa-chevron-left"></i>
                Previous
              </a>
              <a href="#" className={`autoboy-page-btn ${currentPage === 1 ? 'active' : ''}`}>1</a>
              <a href="#" className={`autoboy-page-btn ${currentPage === 2 ? 'active' : ''}`}>2</a>
              <a href="#" className={`autoboy-page-btn ${currentPage === 3 ? 'active' : ''}`}>3</a>
              <span className="autoboy-page-ellipsis">...</span>
              <a href="#" className="autoboy-page-btn">8</a>
              <a href="#" className="autoboy-page-btn next">
                Next
                <i className="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;