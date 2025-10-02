import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function CheckoutScreen() {
  const { theme, isDark } = useTheme();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [selectedAddress, setSelectedAddress] = useState('home');

  const orderItems = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      condition: 'UK Used',
      price: 850000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop'
    }
  ];

  const addresses = [
    { id: 'home', name: 'Home', address: '123 Victoria Island, Lagos', isDefault: true },
    { id: 'office', name: 'Office', address: '456 Ikoyi, Lagos', isDefault: false }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit Card', details: '**** 4242', icon: 'card' },
    { id: 'bank', name: 'Bank Transfer', details: 'Direct transfer', icon: 'business' },
    { id: 'wallet', name: 'Digital Wallet', details: 'Paystack, Flutterwave', icon: 'wallet' }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 5000;
  const total = subtotal + delivery;

  const placeOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Order Placed', 'Your order has been placed successfully!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          {orderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemCondition, { color: theme.textMuted }]}>{item.condition}</Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>₦{item.price.toLocaleString()}</Text>
              </View>
              <Text style={[styles.itemQuantity, { color: theme.textMuted }]}>x{item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
            <TouchableOpacity>
              <Text style={[styles.changeText, { color: theme.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressItem,
                {
                  borderColor: selectedAddress === address.id ? theme.primary : theme.border,
                  backgroundColor: selectedAddress === address.id ? theme.primaryGlow : 'transparent'
                }
              ]}
              onPress={() => setSelectedAddress(address.id)}
            >
              <View style={styles.addressInfo}>
                <View style={styles.addressHeader}>
                  <Text style={[styles.addressName, { color: theme.text }]}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: theme.success + '20' }]}>
                      <Text style={[styles.defaultText, { color: theme.success }]}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.addressText, { color: theme.textMuted }]}>{address.address}</Text>
              </View>
              <View style={[
                styles.radioButton,
                {
                  borderColor: selectedAddress === address.id ? theme.primary : theme.border,
                  backgroundColor: selectedAddress === address.id ? theme.primary : 'transparent'
                }
              ]}>
                {selectedAddress === address.id && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentItem,
                {
                  borderColor: selectedPayment === method.id ? theme.primary : theme.border,
                  backgroundColor: selectedPayment === method.id ? theme.primaryGlow : 'transparent'
                }
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name={method.icon as any} size={24} color={theme.primary} />
                <View style={styles.paymentDetails}>
                  <Text style={[styles.paymentName, { color: theme.text }]}>{method.name}</Text>
                  <Text style={[styles.paymentSubtext, { color: theme.textMuted }]}>{method.details}</Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                {
                  borderColor: selectedPayment === method.id ? theme.primary : theme.border,
                  backgroundColor: selectedPayment === method.id ? theme.primary : 'transparent'
                }
              ]}>
                {selectedPayment === method.id && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Total */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Total</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Subtotal</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Delivery</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>₦{delivery.toLocaleString()}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={[styles.totalLabel, styles.finalTotalLabel, { color: theme.text }]}>Total</Text>
            <Text style={[styles.totalValue, styles.finalTotalValue, { color: theme.primary }]}>₦{total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.bottomSection, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={placeOrder}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.placeOrderGradient}>
            <Ionicons name="bag-check" size={20} color="white" />
            <Text style={styles.placeOrderText}>Place Order - ₦{total.toLocaleString()}</Text>
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
  content: {
    flex: 1,
  },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCondition: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentSubtext: {
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
  },
  placeOrderBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});