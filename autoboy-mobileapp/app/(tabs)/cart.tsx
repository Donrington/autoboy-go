import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { products } from '../../data/products';
import * as Haptics from 'expo-haptics';

export default function CartScreen() {
  const { theme } = useTheme();
  const [cartItems, setCartItems] = useState([
    { ...products[0], quantity: 1, selected: true },
    { ...products[1], quantity: 2, selected: true },
    { ...products[2], quantity: 1, selected: false },
  ]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const updateQuantity = (id: string, change: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const toggleSelection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setCartItems(items => items.filter(item => item.id !== id))
        }
      ]
    );
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 2500;
  const discount = appliedPromo === 'SAVE10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select items to checkout');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Checkout', `Proceeding to payment for ₦${total.toLocaleString()}`);
  };

  const CartItem = ({ item }: { item: any }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
      <TouchableOpacity 
        style={styles.selectBtn}
        onPress={() => toggleSelection(item.id)}
      >
        <View style={[
          styles.checkbox,
          { 
            backgroundColor: item.selected ? theme.primary : 'transparent',
            borderColor: item.selected ? theme.primary : theme.border
          }
        ]}>
          {item.selected && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
      </TouchableOpacity>

      <Image 
        source={{ uri: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&q=80` }}
        style={styles.itemImage}
        resizeMode="cover"
      />

      <View style={styles.itemDetails}>
        <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.itemCondition, { color: theme.textMuted }]}>
          Condition: {item.condition}
        </Text>
        <View style={styles.itemPricing}>
          <Text style={[styles.itemPrice, { color: theme.primary }]}>
            ₦{item.price.toLocaleString()}
          </Text>
          <Text style={[styles.itemOriginalPrice, { color: theme.textMuted }]}>
            ₦{Math.floor(item.price * 1.2).toLocaleString()}
          </Text>
        </View>

        <View style={styles.itemActions}>
          <View style={[styles.quantityContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TouchableOpacity 
              style={styles.quantityBtn}
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Ionicons name="remove" size={16} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: theme.text }]}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityBtn}
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Ionicons name="add" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.removeBtn}
            onPress={() => removeItem(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Shopping Cart</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {cartItems.length} items in your cart
        </Text>
      </View>

      {/* Select All */}
      <View style={styles.selectAllSection}>
        <TouchableOpacity 
          style={styles.selectAllBtn}
          onPress={() => {
            const allSelected = cartItems.every(item => item.selected);
            setCartItems(items => 
              items.map(item => ({ ...item, selected: !allSelected }))
            );
          }}
        >
          <View style={[
            styles.checkbox,
            { 
              backgroundColor: cartItems.every(item => item.selected) ? theme.primary : 'transparent',
              borderColor: cartItems.every(item => item.selected) ? theme.primary : theme.border
            }
          ]}>
            {cartItems.every(item => item.selected) && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text style={[styles.selectAllText, { color: theme.text }]}>Select All</Text>
        </TouchableOpacity>

        <Text style={[styles.selectedCount, { color: theme.textMuted }]}>
          {selectedItems.length} of {cartItems.length} selected
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 300 }}
      >
        {/* Cart Items */}
        <View style={styles.cartItemsSection}>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </View>

        {/* Promo Code */}
        <View style={[styles.promoSection, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
          <View style={styles.promoHeader}>
            <Ionicons name="pricetag" size={20} color={theme.primary} />
            <Text style={[styles.promoTitle, { color: theme.text }]}>Promo Code</Text>
          </View>
          
          {appliedPromo ? (
            <View style={styles.appliedPromo}>
              <View style={[styles.promoTag, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.promoCode, { color: theme.primary }]}>{appliedPromo}</Text>
                <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                  <Ionicons name="close" size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.promoSavings, { color: theme.success }]}>
                You saved ₦{discount.toLocaleString()}!
              </Text>
            </View>
          ) : (
            <View style={styles.promoInput}>
              <TouchableOpacity 
                style={[styles.promoBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setAppliedPromo('SAVE10');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={styles.promoBtnText}>Apply SAVE10</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recommended Items */}
        <View style={styles.recommendedSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>You might also like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedScroll}>
            {products.slice(3, 6).map((product, index) => (
              <TouchableOpacity 
                key={product.id}
                style={[styles.recommendedCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
              >
                <Image 
                  source={{ uri: `https://images.unsplash.com/photo-${[
                    '1572635196237-94b75d6c5620',
                    '1546868871-7041f2a55e12',
                    '1583394838974-d2486ca8fc2e'
                  ][index]}?w=400&h=300&fit=crop&q=80` }}
                  style={styles.recommendedImage}
                  resizeMode="cover"
                />
                <View style={styles.recommendedInfo}>
                  <Text style={[styles.recommendedTitle, { color: theme.text }]} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <Text style={[styles.recommendedPrice, { color: theme.primary }]}>
                    ₦{product.price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Summary */}
      <View style={[styles.bottomSummary, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              Subtotal ({selectedItems.length} items)
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ₦{subtotal.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: shipping === 0 ? theme.success : theme.text }]}>
              {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}
            </Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                -₦{discount.toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>
              ₦{total.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.checkoutBtn,
            { opacity: selectedItems.length === 0 ? 0.5 : 1 }
          ]}
          onPress={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={styles.checkoutGradient}
          >
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.checkoutText}>
              Checkout ({selectedItems.length})
            </Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectAllSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  cartItemsSection: {
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  selectBtn: {
    paddingTop: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCondition: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  itemPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemOriginalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quantityBtn: {
    padding: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 8,
  },
  promoSection: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  appliedPromo: {
    gap: 8,
  },
  promoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  promoCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  promoSavings: {
    fontSize: 14,
    fontWeight: '600',
  },
  promoInput: {
    alignItems: 'flex-start',
  },
  promoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  promoBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recommendedScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recommendedCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recommendedImage: {
    width: '100%',
    height: 100,
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  summaryDetails: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  checkoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});