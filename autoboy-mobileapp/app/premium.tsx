import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function PremiumScreen() {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 2500,
      period: 'month',
      savings: null
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 25000,
      period: 'year',
      savings: '17% OFF'
    }
  ];

  const features = [
    {
      icon: 'diamond',
      title: 'Premium Badge',
      description: 'Stand out with a verified premium badge'
    },
    {
      icon: 'trending-up',
      title: 'Priority Listings',
      description: 'Your products appear first in search results'
    },
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed insights on your sales performance'
    },
    {
      icon: 'chatbubbles',
      title: 'Priority Support',
      description: '24/7 premium customer support'
    },
    {
      icon: 'shield-checkmark',
      title: 'Enhanced Security',
      description: 'Advanced fraud protection and secure transactions'
    },
    {
      icon: 'star',
      title: 'Exclusive Deals',
      description: 'Access to premium-only products and discounts'
    }
  ];

  const subscribeToPremium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Premium Subscription', 'Premium subscription coming soon!');
  };

  const PlanCard = ({ plan }: { plan: any }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        {
          backgroundColor: selectedPlan === plan.id ? theme.primaryGlow : theme.backgroundAlt,
          borderColor: selectedPlan === plan.id ? theme.primary : theme.border,
          borderWidth: selectedPlan === plan.id ? 2 : 1,
        }
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
        {plan.savings && (
          <View style={[styles.savingsBadge, { backgroundColor: theme.success + '20' }]}>
            <Text style={[styles.savingsText, { color: theme.success }]}>{plan.savings}</Text>
          </View>
        )}
      </View>
      <View style={styles.planPrice}>
        <Text style={[styles.price, { color: theme.primary }]}>₦{plan.price.toLocaleString()}</Text>
        <Text style={[styles.period, { color: theme.textMuted }]}>/{plan.period}</Text>
      </View>
      <View style={[
        styles.radioButton,
        {
          borderColor: selectedPlan === plan.id ? theme.primary : theme.border,
          backgroundColor: selectedPlan === plan.id ? theme.primary : 'transparent'
        }
      ]}>
        {selectedPlan === plan.id && (
          <Ionicons name="checkmark" size={12} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const FeatureItem = ({ feature }: { feature: any }) => (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: theme.primaryGlow }]}>
        <Ionicons name={feature.icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
        <Text style={[styles.featureDescription, { color: theme.textMuted }]}>{feature.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Premium Membership</Text>
        <View style={{ width: 24 }} />
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="diamond" size={40} color="white" />
          </View>
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock exclusive features and boost your trading experience
          </Text>
        </LinearGradient>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Your Plan</Text>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Premium Features</Text>
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </View>
        </View>

        {/* Current Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.backgroundAlt }]}>
          <View style={styles.statusHeader}>
            <Ionicons name="information-circle" size={24} color={theme.primary} />
            <Text style={[styles.statusTitle, { color: theme.text }]}>Current Status</Text>
          </View>
          <Text style={[styles.statusText, { color: theme.textMuted }]}>
            You're currently on the free plan. Upgrade to premium to unlock all features.
          </Text>
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={[styles.bottomSection, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.subscribeBtn} onPress={subscribeToPremium}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.subscribeGradient}>
            <Ionicons name="diamond" size={20} color="white" />
            <Text style={styles.subscribeText}>
              Subscribe - ₦{plans.find(p => p.id === selectedPlan)?.price.toLocaleString()}/{plans.find(p => p.id === selectedPlan)?.period}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
          Cancel anytime. No hidden fees.
        </Text>
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
  heroSection: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 20,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  planHeader: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  period: {
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
  featuresSection: {
    padding: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
  },
  subscribeBtn: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  subscribeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
  },
});