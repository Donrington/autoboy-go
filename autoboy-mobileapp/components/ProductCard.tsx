import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  condition: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${product.id}`)}
      style={styles.card}
    >
      <View style={styles.mediaWrap}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.category}</Text>
        </View>
        <TouchableOpacity style={styles.wishlistButton}>
          <Ionicons name="heart-outline" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Ionicons name="star" size={12} color={colors.warning} />
          <Ionicons name="star" size={12} color={colors.warning} />
          <Ionicons name="star" size={12} color={colors.warning} />
          <Ionicons name="star-outline" size={12} color={colors.muted} />
          <Text style={styles.ratingText}>(24)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.condition}>{product.condition}</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.price}>₦{product.price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  mediaWrap: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: colors.text, fontWeight: '600', fontSize: 10 },
  body: { padding: 12, gap: 6 },
  title: { color: colors.text, fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  condition: {
    color: colors.muted,
    fontSize: 11,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  price: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  wishlistButton: { position: 'absolute', top: 8, right: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: colors.muted, fontSize: 11, marginLeft: 4 },
});