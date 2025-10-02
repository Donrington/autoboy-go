import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('uk-used');
  const [quantity, setQuantity] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock product data
  const product = {
    id: id,
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 850000,
    originalPrice: 950000,
    condition: 'UK Used',
    rating: 4.8,
    reviews: 124,
    inStock: 5,
    seller: {
      name: 'TechHub Lagos',
      rating: 4.9,
      verified: true,
      responseTime: '2 hours',
      totalSales: 1250,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'
    ],
    description: 'Pristine iPhone 15 Pro Max in excellent condition. This device has been carefully maintained and comes with original accessories. Perfect for photography enthusiasts and power users.',
    specifications: {
      'Storage': '256GB',
      'Color': 'Natural Titanium',
      'Battery Health': '98%',
      'Screen': 'Perfect condition',
      'Camera': 'All lenses working perfectly',
      'Warranty': '6 months seller warranty'
    },
    features: [
      'A17 Pro chip with 6-core GPU',
      'Pro camera system with 48MP main',
      'Action Button for quick shortcuts',
      'Titanium design with textured matte glass',
      'USB-C connector',
      '5G connectivity'
    ],
    location: 'Lagos, Nigeria',
    swapAvailable: true,
    deliveryTime: '1-2 days',
    freeDelivery: true,
    tags: ['Premium', 'Fast Shipping', 'Verified Seller']
  };

  const conditions = [
    { id: 'new', name: 'Brand New', price: 950000, available: false, discount: 0 },
    { id: 'uk-used', name: 'UK Used', price: 850000, available: true, discount: 11 },
    { id: 'us-used', name: 'US Used', price: 780000, available: true, discount: 18 },
    { id: 'grade-a', name: 'Grade A', price: 720000, available: true, discount: 24 },
  ];

  const toggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFavorite(!isFavorite);
  };

  const shareProduct = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out this ${product.name} on AutoBoy! Only ₦${product.price.toLocaleString()}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Added to Cart', `${quantity} ${product.name} added to your cart`);
  };

  const buyNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/checkout');
  };

  const initiateSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/swap-offer/index' as any);
  };

  const contactSeller = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/chat/index' as any);
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(product.inStock, quantity + delta));
    if (newQuantity !== quantity) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(newQuantity);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <BlurView intensity={80} tint={theme.background === '#000000' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={shareProduct} style={[styles.headerBtn, { backgroundColor: theme.backgroundAlt + '80' }]}>
            <Ionicons name="share-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={[styles.headerBtn, { backgroundColor: theme.backgroundAlt + '80' }]}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF6B6B" : theme.text} 
            />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentImageIndex ? theme.primary : 'rgba(255,255,255,0.5)',
                    width: index === currentImageIndex ? 24 : 8,
                  }
                ]}
              />
            ))}
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {product.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={[styles.productInfo, { backgroundColor: theme.background }]}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                <Text style={[styles.brandName, { color: theme.textMuted }]}>{product.brand}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.rating, { color: theme.text }]}>{product.rating}</Text>
                <Text style={[styles.reviews, { color: theme.textMuted }]}>({product.reviews})</Text>
              </View>
            </View>

            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: theme.primary }]}>₦{product.price.toLocaleString()}</Text>
                <Text style={[styles.originalPrice, { color: theme.textMuted }]}>₦{product.originalPrice.toLocaleString()}</Text>
              </View>
              <View style={[styles.discountBadge, { backgroundColor: theme.success + '20' }]}>
                <Text style={[styles.discountText, { color: theme.success }]}>
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </Text>
              </View>
            </View>

            <View style={styles.stockInfo}>
              <Ionicons name="checkmark-circle" size={16} color={theme.success} />
              <Text style={[styles.stockText, { color: theme.success }]}>
                {product.inStock} items in stock
              </Text>
              {product.freeDelivery && (
                <>
                  <Text style={[styles.separator, { color: theme.textMuted }]}>•</Text>
                  <Ionicons name="car-outline" size={16} color={theme.primary} />
                  <Text style={[styles.freeDeliveryText, { color: theme.primary }]}>Free Delivery</Text>
                </>
              )}
            </View>
          </View>

          {/* Condition Options */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Conditions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conditionsScroll}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.conditionOption,
                    {
                      backgroundColor: selectedCondition === condition.id ? theme.primary : theme.background,
                      borderColor: selectedCondition === condition.id ? theme.primary : theme.border,
                      opacity: condition.available ? 1 : 0.5
                    }
                  ]}
                  onPress={() => condition.available && setSelectedCondition(condition.id)}
                  disabled={!condition.available}
                >
                  <Text style={[
                    styles.conditionName,
                    { color: selectedCondition === condition.id ? 'white' : theme.text }
                  ]}>
                    {condition.name}
                  </Text>
                  <Text style={[
                    styles.conditionPrice,
                    { color: selectedCondition === condition.id ? 'white' : theme.primary }
                  ]}>
                    ₦{condition.price.toLocaleString()}
                  </Text>
                  {condition.discount > 0 && (
                    <Text style={[
                      styles.conditionDiscount,
                      { color: selectedCondition === condition.id ? 'rgba(255,255,255,0.8)' : theme.success }
                    ]}>
                      {condition.discount}% off
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quantity Selector */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={[styles.quantityBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => adjustQuantity(-1)}
              >
                <Ionicons name="remove" size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
              <TouchableOpacity 
                style={[styles.quantityBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => adjustQuantity(1)}
              >
                <Ionicons name="add" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Seller Info */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Seller Information</Text>
            <View style={styles.sellerCard}>
              <Image source={{ uri: product.seller.avatar }} style={styles.sellerAvatar} />
              <View style={styles.sellerDetails}>
                <View style={styles.sellerNameRow}>
                  <Text style={[styles.sellerName, { color: theme.text }]}>{product.seller.name}</Text>
                  {product.seller.verified && (
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                  )}
                </View>
                <View style={styles.sellerStats}>
                  <View style={styles.sellerStat}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.sellerStatText, { color: theme.textMuted }]}>
                      {product.seller.rating} rating
                    </Text>
                  </View>
                  <Text style={[styles.separator, { color: theme.textMuted }]}>•</Text>
                  <Text style={[styles.sellerStatText, { color: theme.textMuted }]}>
                    {product.seller.totalSales} sales
                  </Text>
                  <Text style={[styles.separator, { color: theme.textMuted }]}>•</Text>
                  <Text style={[styles.sellerStatText, { color: theme.textMuted }]}>
                    Responds in {product.seller.responseTime}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={contactSeller} style={[styles.contactBtn, { borderColor: theme.primary }]}>
                <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.description, { color: theme.textMuted }]}>{product.description}</Text>
          </View>

          {/* Key Features */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Features</Text>
            <View style={styles.featuresList}>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.featureText, { color: theme.textMuted }]}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Specifications */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Specifications</Text>
            <View style={styles.specsList}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={[styles.specRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.specKey, { color: theme.textMuted }]}>{key}</Text>
                  <Text style={[styles.specValue, { color: theme.text }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery Info */}
          <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery & Returns</Text>
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryItem}>
                <Ionicons name="location-outline" size={16} color={theme.primary} />
                <Text style={[styles.deliveryText, { color: theme.textMuted }]}>Ships from {product.location}</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="time-outline" size={16} color={theme.primary} />
                <Text style={[styles.deliveryText, { color: theme.textMuted }]}>Delivery in {product.deliveryTime}</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color={theme.primary} />
                <Text style={[styles.deliveryText, { color: theme.textMuted }]}>7-day return policy</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity onPress={addToCart} style={[styles.actionBtn, styles.cartBtn, { borderColor: theme.primary }]}>
          <Ionicons name="cart-outline" size={20} color={theme.primary} />
          <Text style={[styles.cartBtnText, { color: theme.primary }]}>Add to Cart</Text>
        </TouchableOpacity>
        
        {product.swapAvailable && (
          <TouchableOpacity onPress={initiateSwap} style={[styles.actionBtn, styles.swapBtn, { backgroundColor: theme.warning }]}>
            <Ionicons name="swap-horizontal" size={20} color="white" />
            <Text style={styles.swapBtnText}>Swap</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={buyNow} style={[styles.actionBtn, styles.buyBtn]}>
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={styles.buyBtnGradient}
          >
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  imageContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  productImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  tagsContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviews: {
    fontSize: 14,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
  },
  freeDeliveryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  conditionsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  conditionOption: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  conditionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionPrice: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  conditionDiscount: {
    fontSize: 10,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerStatText: {
    fontSize: 12,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  specsList: {
    gap: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  specKey: {
    fontSize: 14,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryInfo: {
    gap: 12,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryText: {
    fontSize: 14,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  swapBtn: {
    flexDirection: 'row',
    gap: 6,
    flex: 0.8,
  },
  swapBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buyBtn: {
    overflow: 'hidden',
  },
  buyBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  buyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});