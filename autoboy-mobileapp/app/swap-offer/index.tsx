import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function SwapOfferScreen() {
  const { theme, isDark } = useTheme();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cashAmount, setCashAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  // Mock user's items for swap
  const myItems = [
    {
      id: '1',
      name: 'iPhone 14 Pro',
      condition: 'UK Used',
      value: 650000,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      name: 'MacBook Air M2',
      condition: 'Grade A',
      value: 850000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop'
    },
    {
      id: '3',
      name: 'iPad Pro 11"',
      condition: 'UK Used',
      value: 450000,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop'
    },
    {
      id: '4',
      name: 'AirPods Pro 2',
      condition: 'Brand New',
      value: 180000,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop'
    }
  ];

  // Target item (what they want)
  const targetItem = {
    name: 'iPhone 15 Pro Max',
    condition: 'UK Used',
    value: 850000,
    seller: 'TechHub Lagos',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop'
  };

  const toggleItemSelection = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateTotalValue = () => {
    const itemsValue = selectedItems.reduce((total, itemId) => {
      const item = myItems.find(i => i.id === itemId);
      return total + (item?.value || 0);
    }, 0);
    const cash = parseInt(cashAmount) || 0;
    return itemsValue + cash;
  };

  const getValueDifference = () => {
    return calculateTotalValue() - targetItem.value;
  };

  const submitOffer = () => {
    if (selectedItems.length === 0 && !cashAmount) {
      Alert.alert('Invalid Offer', 'Please select at least one item or add cash to your offer.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Offer Submitted',
      'Your swap offer has been sent to the seller. You will be notified when they respond.',
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const SwapItem = ({ item, isSelected }: { item: any; isSelected: boolean }) => (
    <TouchableOpacity
      style={[
        styles.swapItem,
        {
          backgroundColor: theme.backgroundAlt,
          borderColor: isSelected ? theme.primary : theme.border,
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
      onPress={() => toggleItemSelection(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemCondition, { color: theme.textMuted }]}>{item.condition}</Text>
        <Text style={[styles.itemValue, { color: theme.primary }]}>₦{item.value.toLocaleString()}</Text>
      </View>
      {isSelected && (
        <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Swap Offer</Text>
        <View style={{ width: 24 }} />
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Target Item */}
        <View style={styles.targetSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>You Want</Text>
          <View style={[styles.targetItem, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
            <Image source={{ uri: targetItem.image }} style={styles.targetImage} />
            <View style={styles.targetInfo}>
              <Text style={[styles.targetName, { color: theme.text }]}>{targetItem.name}</Text>
              <Text style={[styles.targetCondition, { color: theme.textMuted }]}>{targetItem.condition}</Text>
              <Text style={[styles.targetValue, { color: theme.primary }]}>₦{targetItem.value.toLocaleString()}</Text>
              <Text style={[styles.targetSeller, { color: theme.textMuted }]}>by {targetItem.seller}</Text>
            </View>
          </View>
        </View>

        {/* Swap Icon */}
        <View style={styles.swapIconContainer}>
          <View style={[styles.swapIcon, { backgroundColor: theme.primaryGlow }]}>
            <Ionicons name="swap-horizontal" size={24} color={theme.primary} />
          </View>
        </View>

        {/* Your Items */}
        <View style={styles.yourItemsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Items</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Select items you want to offer in exchange
          </Text>
          
          <View style={styles.itemsGrid}>
            {myItems.map((item) => (
              <SwapItem
                key={item.id}
                item={item}
                isSelected={selectedItems.includes(item.id)}
              />
            ))}
          </View>
        </View>

        {/* Cash Addition */}
        <View style={styles.cashSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Cash (Optional)</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Add cash to balance the trade value
          </Text>
          
          <View style={[styles.cashInput, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
            <Text style={[styles.currencySymbol, { color: theme.text }]}>₦</Text>
            <TextInput
              style={[styles.cashTextInput, { color: theme.text }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              value={cashAmount}
              onChangeText={setCashAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Value Summary */}
        <View style={[styles.summarySection, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Offer Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Selected Items Value:</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ₦{selectedItems.reduce((total, itemId) => {
                const item = myItems.find(i => i.id === itemId);
                return total + (item?.value || 0);
              }, 0).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Cash Amount:</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ₦{(parseInt(cashAmount) || 0).toLocaleString()}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, styles.totalLabel, { color: theme.text }]}>Total Offer:</Text>
            <Text style={[styles.summaryValue, styles.totalValue, { color: theme.primary }]}>
              ₦{calculateTotalValue().toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Target Value:</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ₦{targetItem.value.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Difference:</Text>
            <Text style={[
              styles.summaryValue,
              { color: getValueDifference() >= 0 ? theme.success : theme.error }
            ]}>
              {getValueDifference() >= 0 ? '+' : ''}₦{Math.abs(getValueDifference()).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitBtn, { opacity: selectedItems.length > 0 || cashAmount ? 1 : 0.5 }]}
            onPress={submitOffer}
            disabled={selectedItems.length === 0 && !cashAmount}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.submitGradient}
            >
              <Ionicons name="swap-horizontal" size={20} color="white" />
              <Text style={styles.submitText}>Submit Swap Offer</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  targetSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  targetItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  targetImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  targetInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  targetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  targetCondition: {
    fontSize: 14,
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  targetSeller: {
    fontSize: 12,
  },
  swapIconContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  swapIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yourItemsSection: {
    padding: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swapItem: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCondition: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cashInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  cashTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  submitSection: {
    padding: 20,
    paddingBottom: 40,
  },
  submitBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});