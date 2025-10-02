import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
  Image
} from 'react-native';
import { products, categories } from '../../data/products';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop&q=80',
  ];

  const featuredCategories = [
    { id: 'phones', name: 'Phones', icon: 'phone-portrait', emoji: '📱' },
    { id: 'consoles', name: 'Consoles', icon: 'game-controller', emoji: '🎮' },
    { id: 'laptops', name: 'Laptops', icon: 'laptop', emoji: '💻' },
    { id: 'cameras', name: 'Cameras', icon: 'camera', emoji: '📷' },
    { id: 'audio', name: 'Audio', icon: 'headset', emoji: '🎧' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/browse?category=${categoryId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={true}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.headerTop}>
            <View style={styles.deliveryInfo}>
              <View style={[styles.deliveryDot, { backgroundColor: theme.primary }]} />
              <View>
                <Text style={[styles.deliveryLabel, { color: theme.textMuted }]}>Delivery address</Text>
                <Text style={[styles.deliveryAddress, { color: theme.text }]}>92 High Street, Lagos</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <ThemeToggle size={20} />
              <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: theme.backgroundAlt }]}>
                <Ionicons name="notifications-outline" size={20} color={theme.text} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity 
            style={[styles.searchBar, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
            onPress={() => router.push('/(tabs)/browse')}
          >
            <Ionicons name="search" size={20} color={theme.textMuted} />
            <Text style={[styles.searchPlaceholder, { color: theme.textMuted }]}>
              Search the entire shop
            </Text>
          </TouchableOpacity>

          {/* Delivery Banner */}
          <View style={[styles.deliveryBanner, { backgroundColor: theme.primaryGlow }]}>
            <Text style={[styles.deliveryText, { color: theme.primary }]}>
              Delivery is <Text style={{ fontWeight: '700' }}>50% cheaper</Text>
            </Text>
            <Ionicons name="bicycle" size={24} color={theme.primary} />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/browse')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {featuredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Flash Sale */}
        <View style={styles.flashSaleSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.flashSaleHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Flash Sale</Text>
              <View style={styles.flashSaleBadge}>
                <Text style={styles.flashSaleTime}>02:59:23</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/browse')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
          >
            {products.slice(0, 6).map((product, index) => (
              <TouchableOpacity 
                key={product.id} 
                style={[styles.productCard, { 
                  backgroundColor: theme.backgroundAlt,
                  borderColor: theme.border,
                  shadowColor: theme.shadow
                }]}
                activeOpacity={0.9}
              >
                <View style={styles.productImageContainer}>
                  <Image 
                    source={{ uri: `https://images.unsplash.com/photo-${[
                      '1511707171634-5f897ff02aa9', // iPhone
                      '1505740420928-5e560c06d30e', // Headphones
                      '1484704849700-f032a568e944', // MacBook
                      '1572635196237-94b75d6c5620', // AirPods
                      '1546868871-7041f2a55e12', // Samsung phone
                      '1583394838974-d2486ca8fc2e'  // Gaming headset
                    ][index]}?w=400&h=300&fit=crop&q=80` }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity style={styles.favoriteBtn}>
                    <Ionicons name="heart-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <View style={styles.productPricing}>
                    <Text style={[styles.productPrice, { color: theme.text }]}>
                      ₦{product.price.toLocaleString()}
                    </Text>
                    <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                      ₦{Math.floor(product.price * 1.3).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Products */}
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Now</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/browse')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trendingGrid}>
            {products.slice(0, 4).map((product, index) => (
              <TouchableOpacity 
                key={product.id} 
                style={[styles.trendingCard, { 
                  backgroundColor: theme.backgroundAlt,
                  borderColor: theme.border,
                  shadowColor: theme.shadow
                }]}
                activeOpacity={0.9}
              >
                <Image 
                  source={{ uri: `https://images.unsplash.com/photo-${[
                    '1593642632823-8f785ba67e45', // iPhone
                    '1526738549149-8e07eca6c147', // Gaming setup
                    '1606983340077-d23ecd204daa', // Camera
                    '1434494878577-86c23bcb06b9'  // Apple Watch
                  ][index]}?w=400&h=300&fit=crop&q=80` }}
                  style={styles.trendingImage}
                  resizeMode="cover"
                />
                
                <View style={styles.trendingInfo}>
                  <Text style={[styles.trendingTitle, { color: theme.text }]} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={[styles.trendingPrice, { color: theme.primary }]}>
                    ₦{product.price.toLocaleString()}
                  </Text>
                  <View style={styles.trendingMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={[styles.rating, { color: theme.textSecondary }]}>4.8</Text>
                    </View>
                    <Text style={[styles.reviews, { color: theme.textMuted }]}>(24)</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
              onPress={() => router.push('/(tabs)/sell-swap')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={24} color="white" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: theme.text }]}>Sell Item</Text>
              <Text style={[styles.quickActionSubtext, { color: theme.textMuted }]}>List your gadgets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
              onPress={() => router.push('/(tabs)/browse')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.quickActionIcon}>
                <Ionicons name="swap-horizontal" size={24} color="white" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: theme.text }]}>Swap Deal</Text>
              <Text style={[styles.quickActionSubtext, { color: theme.textMuted }]}>Trade items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryAddress: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    position: 'relative',
    padding: 10,
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 16,
    fontWeight: '500',
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  flashSaleSection: {
    paddingVertical: 24,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashSaleBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flashSaleTime: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  productsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    height: 120,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  trendingSection: {
    paddingVertical: 24,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  trendingCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trendingImage: {
    width: '100%',
    height: 100,
  },
  trendingInfo: {
    padding: 12,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 16,
  },
  trendingPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
  },
  reviews: {
    fontSize: 11,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickActionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
});