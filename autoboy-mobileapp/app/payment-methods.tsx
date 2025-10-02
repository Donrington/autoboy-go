import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function PaymentMethods() {
  const { theme } = useTheme();
  const [cards] = useState([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false
    }
  ]);

  const addPaymentMethod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Add Payment Method', 'Payment method integration coming soon!');
  };

  const PaymentCard = ({ card }: { card: any }) => (
    <View style={[styles.paymentCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Ionicons 
            name={card.type === 'visa' ? 'card' : 'card'} 
            size={24} 
            color={card.type === 'visa' ? '#1A1F71' : '#EB001B'} 
          />
          <Text style={[styles.cardNumber, { color: theme.text }]}>
            •••• •••• •••• {card.last4}
          </Text>
        </View>
        {card.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: theme.primaryGlow }]}>
            <Text style={[styles.defaultText, { color: theme.primary }]}>Default</Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardExpiry, { color: theme.textMuted }]}>
        Expires {card.expiryMonth}/{card.expiryYear}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.cardAction}>
          <Text style={[styles.cardActionText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardAction}>
          <Text style={[styles.cardActionText, { color: theme.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Payment Methods</Text>
        <TouchableOpacity onPress={addPaymentMethod} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Saved Cards</Text>
        
        {cards.map((card) => (
          <PaymentCard key={card.id} card={card} />
        ))}

        <TouchableOpacity 
          style={[styles.addCardBtn, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
          onPress={addPaymentMethod}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
          <Text style={[styles.addCardText, { color: theme.primary }]}>Add New Card</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: theme.backgroundAlt }]}>
          <Ionicons name="shield-checkmark" size={24} color={theme.success} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Secure Payments</Text>
            <Text style={[styles.infoText, { color: theme.textMuted }]}>
              Your payment information is encrypted and secure. We never store your full card details.
            </Text>
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
  addBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  paymentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 14,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 20,
  },
  cardAction: {
    padding: 5,
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});