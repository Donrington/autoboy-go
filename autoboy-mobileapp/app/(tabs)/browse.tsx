import { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList 
} from 'react-native';
import { products, categories } from '../../data/products';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function BrowseScreen() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    const byQuery = products.filter(p => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
    return activeCategory === 'All' ? byQuery : byQuery.filter(p => p.category === activeCategory);
  }, [query, activeCategory]);

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(category);
  };

  const ProductCard = ({ product, index }: { product: any; index: number }) => (
    <TouchableOpacity 
      style={[
        viewMode === 'grid' ? styles.gridCard : styles.listCard,
        { backgroundColor: theme.backgroundAlt, borderColor: theme.border, shadowColor: theme.shadow }
      ]}
      activeOpacity={0.9}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/product/${product.id}`);
      }}
    >
      <View style={viewMode === 'grid' ? styles.gridImageContainer : styles.listImageContainer}>
        <Image 
          source={{ uri: `https://images.unsplash.com/photo-${[
            '1511707171634-5f897ff02aa9', // iPhone
            '1505740420928-5e560c06d30e', // Headphones
            '1484704849700-f032a568e944', // MacBook
            '1572635196237-94b75d6c5620', // AirPods
            '1546868871-7041f2a55e12', // Samsung phone
            '1583394838974-d2486ca8fc2e', // Gaming headset
            '1593642632823-8f785ba67e45', // iPhone 2
            '1526738549149-8e07eca6c147', // Gaming setup
          ][index % 8]}?w=400&h=300&fit=crop&q=80` }}
          style={viewMode === 'grid' ? styles.gridImage : styles.listImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteBtn}>
          <Ionicons name="heart-outline" size={16} color="white" />
        </TouchableOpacity>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{product.condition}</Text>
        </View>
      </View>
      
      <View style={viewMode === 'grid' ? styles.gridInfo : styles.listInfo}>
        <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={viewMode === 'grid' ? 2 : 1}>
          {product.title}
        </Text>
        <Text style={[styles.productCategory, { color: theme.textMuted }]}>{product.category}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={[styles.rating, { color: theme.textSecondary }]}>4.8</Text>
          <Text style={[styles.reviews, { color: theme.textMuted }]}>(24)</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>₦{product.price.toLocaleString()}</Text>
          {viewMode === 'list' && (
            <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="bag-add" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Catalog</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {filtered.length} products available
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="options" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {['All', ...categories].map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => handleCategoryPress(category)}
            style={[
              styles.categoryPill,
              { 
                backgroundColor: activeCategory === category ? theme.primary : theme.backgroundAlt,
                borderColor: activeCategory === category ? theme.primary : theme.border
              }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: activeCategory === category ? 'white' : theme.text }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Mode Toggle */}
      <View style={styles.viewModeSection}>
        <View style={styles.sortInfo}>
          <Text style={[styles.sortText, { color: theme.textMuted }]}>Sort by: Popular</Text>
        </View>
        <View style={[styles.viewModeToggle, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.viewModeBtn,
              { backgroundColor: viewMode === 'grid' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons 
              name="grid" 
              size={16} 
              color={viewMode === 'grid' ? 'white' : theme.textMuted} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeBtn,
              { backgroundColor: viewMode === 'list' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={16} 
              color={viewMode === 'list' ? 'white' : theme.textMuted} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products */}
      <FlatList
        data={filtered}
        renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={[
          styles.productsList,
          { paddingBottom: 120 }
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  filterBtn: {
    padding: 8,
    borderRadius: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewModeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sortInfo: {},
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  viewModeBtn: {
    padding: 8,
    borderRadius: 8,
  },
  productsList: {
    paddingHorizontal: 20,
  },
  // Grid View Styles
  gridCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridImageContainer: {
    height: 140,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridInfo: {
    padding: 12,
  },
  // List View Styles
  listCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  // Common Styles
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  productCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
  },
  reviews: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
  },
  addToCartBtn: {
    padding: 8,
    borderRadius: 12,
  },
});