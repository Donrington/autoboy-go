import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function Favorites() {
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', count: 24 },
    { id: 'phones', name: 'Phones', count: 8 },
    { id: 'laptops', name: 'Laptops', count: 6 },
    { id: 'accessories', name: 'Accessories', count: 10 },
  ];

  const favoriteProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: '₦1,200,000',
      originalPrice: '₦1,400,000',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      condition: 'UK Used',
      grade: 'Grade A',
      seller: 'TechHub Lagos',
      rating: 4.8,
      category: 'phones',
      addedDate: '2 days ago',
      discount: 14,
    },
    {
      id: '2',
      name: 'MacBook Pro M3',
      price: '₦2,800,000',
      originalPrice: '₦3,200,000',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop',
      condition: 'US Used',
      grade: 'Grade A',
      seller: 'Apple Store NG',
      rating: 4.9,
      category: 'laptops',
      addedDate: '1 week ago',
      discount: 13,
    },
    {
      id: '3',
      name: 'AirPods Pro 2nd Gen',
      price: '₦180,000',
      originalPrice: '₦220,000',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
      condition: 'Brand New',
      grade: 'Grade A+',
      seller: 'Audio World',
      rating: 4.7,
      category: 'accessories',
      addedDate: '3 days ago',
      discount: 18,
    },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? favoriteProducts 
    : favoriteProducts.filter(product => product.category === selectedCategory);

  const handleRemoveFavorite = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Remove from favorites logic here
  };

  const ProductCard = ({ product }: { product: any }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: theme.backgroundAlt + '80' }]}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(product.id)}
          >
            <Ionicons name="heart" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <View style={styles.conditionRow}>
            <View style={[styles.conditionBadge, { backgroundColor: theme.primaryGlow }]}>
              <Text style={[styles.conditionText, { color: theme.primary }]}>
                {product.condition}
              </Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: '#4CAF5020' }]}>
              <Text style={styles.gradeText}>{product.grade}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>{product.price}</Text>
            {product.originalPrice && (
              <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                {product.originalPrice}
              </Text>
            )}
          </View>

          <View style={styles.sellerRow}>
            <View style={styles.sellerInfo}>
              <Ionicons name="storefront" size={14} color={theme.textMuted} />
              <Text style={[styles.sellerName, { color: theme.textMuted }]}>
                {product.seller}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.rating, { color: theme.textMuted }]}>
                {product.rating}
              </Text>
            </View>
          </View>

          <Text style={[styles.addedDate, { color: theme.textMuted }]}>
            Added {product.addedDate}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <BlurView intensity={20} tint="light" style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorite Products</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>

      <View style={styles.content}>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category.id 
                    ? theme.primary 
                    : theme.backgroundAlt + '80'
                }
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id 
                    ? 'white' 
                    : theme.text
                }
              ]}>
                {category.name}
              </Text>
              <View style={[
                styles.categoryCount,
                {
                  backgroundColor: selectedCategory === category.id 
                    ? 'rgba(255,255,255,0.2)' 
                    : theme.primaryGlow
                }
              ]}>
                <Text style={[
                  styles.categoryCountText,
                  {
                    color: selectedCategory === category.id 
                      ? 'white' 
                      : theme.primary
                  }
                ]}>
                  {category.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No favorites yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Start adding products to your favorites to see them here
              </Text>
              <TouchableOpacity 
                style={[styles.browseButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/(tabs)/browse')}
              >
                <Text style={styles.browseButtonText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  searchButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  categoryCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productsContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 6,
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerName: {
    fontSize: 12,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 2,
  },
  addedDate: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});