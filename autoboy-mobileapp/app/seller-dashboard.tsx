import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function SellerDashboard() {
  const { theme } = useTheme();

  const stats = {
    totalSales: 1250000,
    totalOrders: 45,
    activeListings: 12,
    rating: 4.8,
    responseRate: 98
  };

  const recentOrders = [
    {
      id: '1',
      product: 'iPhone 15 Pro Max',
      buyer: 'John Doe',
      amount: 850000,
      status: 'completed',
      date: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=60&h=60&fit=crop'
    },
    {
      id: '2',
      product: 'MacBook Air M2',
      buyer: 'Jane Smith',
      amount: 750000,
      status: 'pending',
      date: '2024-01-14',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&h=60&fit=crop'
    }
  ];

  const quickActions = [
    { id: 'add-product', title: 'Add Product', icon: 'add-circle', color: theme.primary },
    { id: 'orders', title: 'Orders', icon: 'receipt', color: theme.warning },
    { id: 'analytics', title: 'Analytics', icon: 'analytics', color: theme.success },
    { id: 'messages', title: 'Messages', icon: 'chatbubbles', color: theme.error }
  ];

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundAlt }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.textMuted }]}>{title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Seller Dashboard</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          <View style={[styles.notificationBadge, { backgroundColor: theme.error }]}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back, Seller!</Text>
          <Text style={styles.welcomeSubtitle}>Here's your business overview</Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Sales" value={`₦${(stats.totalSales / 1000000).toFixed(1)}M`} icon="trending-up" color={theme.success} />
          <StatCard title="Orders" value={stats.totalOrders} icon="receipt" color={theme.primary} />
          <StatCard title="Active Listings" value={stats.activeListings} icon="storefront" color={theme.warning} />
          <StatCard title="Rating" value={stats.rating} icon="star" color="#FFD700" />
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: theme.background }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                <Text style={[styles.actionTitle, { color: theme.text }]}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/transaction-history')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: theme.background }]}>
              <Image source={{ uri: order.image }} style={styles.orderImage} />
              <View style={styles.orderDetails}>
                <Text style={[styles.orderProduct, { color: theme.text }]}>{order.product}</Text>
                <Text style={[styles.orderBuyer, { color: theme.textMuted }]}>Buyer: {order.buyer}</Text>
                <Text style={[styles.orderAmount, { color: theme.primary }]}>₦{order.amount.toLocaleString()}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: order.status === 'completed' ? theme.successGlow : theme.warningGlow }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: order.status === 'completed' ? theme.success : theme.warning }
                ]}>
                  {order.status}
                </Text>
              </View>
            </View>
          ))}
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
  notificationBtn: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
  },
  orderProduct: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderBuyer: {
    fontSize: 12,
    marginBottom: 2,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});