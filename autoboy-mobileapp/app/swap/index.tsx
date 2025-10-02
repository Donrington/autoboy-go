import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { products } from '../../data/products';
import { Ionicons } from '@expo/vector-icons';

export default function SwapScreen() {
  const [myItem, setMyItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const swappableItems = useMemo(() => 
    products.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10), [searchQuery]
  );

  const handleSwapRequest = (targetItem: any) => {
    console.log('Swap request:', { myItem, targetItem: targetItem.title });
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Swap Deals</Text>
      <Text style={styles.subtitle}>Trade your gadgets with other users</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What do you want to swap?</Text>
        <TextInput
          placeholder="Enter your item (e.g., iPhone 13)"
          placeholderTextColor={colors.muted}
          value={myItem}
          onChangeText={setMyItem}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Find items to swap with</Text>
        <TextInput
          placeholder="Search for items you want"
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
        />
        
        <View style={styles.matchingSection}>
          <View style={styles.matchHeader}>
            <Ionicons name="sync" size={20} color={colors.primary} />
            <Text style={styles.matchTitle}>Swap Matches</Text>
          </View>
          
          {swappableItems.map(item => (
            <View key={item.id} style={styles.swapCard}>
              <Image source={{ uri: item.image }} style={styles.swapImage} />
              <View style={styles.swapInfo}>
                <Text style={styles.swapItemTitle}>{item.title}</Text>
                <Text style={styles.swapPrice}>${item.price}</Text>
                <Text style={styles.swapCondition}>{item.condition}</Text>
              </View>
              <TouchableOpacity 
                style={styles.swapButton}
                onPress={() => handleSwapRequest(item)}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.textOnPrimary} />
                <Text style={styles.swapButtonText}>Swap</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: 12,
  },
  matchingSection: {
    marginTop: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  swapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  swapImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  swapInfo: {
    flex: 1,
  },
  swapItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  swapPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  swapCondition: {
    fontSize: 12,
    color: colors.muted,
  },
  swapButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swapButtonText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});