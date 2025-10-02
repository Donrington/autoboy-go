import { View, StyleSheet } from 'react-native';
import ProductCard from './ProductCard';

import { Product } from '../types';
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View style={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
