import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function SellerDashboardScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics' | 'earnings'>('overview');

  const stats = {
    activeProducts: 24,
    pendingOrders: 5,
    totalSales: 152,
    totalEarnings: 2500000
  };

  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [65000, 89000, 120000, 81000, 156000, 255000, 140000],
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      strokeWidth: 3
    }]
  };

  const categoryData = [
    { name: 'iPhone', population: 35, color: colors.primary, legendFontColor: colors.text },
    { name: 'Samsung', population: 25, color: '#16A34A', legendFontColor: colors.text },
    { name: 'Google', population: 20, color: '#4ADE80', legendFontColor: colors.text },
    { name: 'OnePlus', population: 15, color: '#10B981', legendFontColor: colors.text },
    { name: 'Others', population: 5, color: '#6B7280', legendFontColor: colors.text }
  ];

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const renderOverview = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('products')}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('orders')}>
          <Ionicons name="cube-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>Manage Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('analytics')}>
          <Ionicons name="analytics-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>View Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.activeProducts}</Text>
          <Text style={styles.statLabel}>Active Products</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cart-outline" size={24} color={colors.warning} />
          <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
          <Text style={styles.statValue}>{stats.totalSales}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{formatCurrency(stats.totalEarnings)}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
      </View>

      {/* Sales Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly Sales Overview</Text>
        <LineChart
          data={salesData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            labelColor: (opacity = 1) => colors.text,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {[
          { id: '#ORD-001', customer: 'John Doe', product: 'iPhone 15 Pro Max', amount: 1200000, status: 'pending' },
          { id: '#ORD-002', customer: 'Jane Smith', product: 'Samsung Galaxy S24', amount: 950000, status: 'shipped' },
          { id: '#ORD-003', customer: 'Mike Johnson', product: 'Google Pixel 8', amount: 750000, status: 'delivered' }
        ].map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderProduct}>{order.product}</Text>
              <Text style={styles.orderCustomer}>{order.customer}</Text>
              <Text style={styles.orderId}>{order.id}</Text>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sales Trend</Text>
        <LineChart
          data={salesData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            labelColor: (opacity = 1) => colors.text,
            style: { borderRadius: 16 }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Product Categories</Text>
        <PieChart
          data={categoryData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            color: (opacity = 1) => colors.text,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 50]}
          absolute
        />
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Conversion Rate</Text>
          <Text style={styles.metricValue}>3.2%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Order Value</Text>
          <Text style={styles.metricValue}>{formatCurrency(850000)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Return Rate</Text>
          <Text style={styles.metricValue}>1.8%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Customer Satisfaction</Text>
          <Text style={styles.metricValue}>4.7/5</Text>
        </View>
      </View>
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'shipped': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.danger;
      default: return colors.muted;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'analytics': return renderAnalytics();
      case 'products': return <Text style={styles.placeholder}>Products Management - Coming Soon</Text>;
      case 'orders': return <Text style={styles.placeholder}>Order Management - Coming Soon</Text>;
      case 'earnings': return <Text style={styles.placeholder}>Earnings Details - Coming Soon</Text>;
      default: return renderOverview();
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home-outline' },
          { key: 'products', label: 'Products', icon: 'cube-outline' },
          { key: 'orders', label: 'Orders', icon: 'receipt-outline' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics-outline' },
          { key: 'earnings', label: 'Earnings', icon: 'wallet-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.key ? colors.primary : colors.muted} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  quickActionText: {
    color: colors.text,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 8,
  },
  statLabel: {
    color: colors.muted,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  section: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfo: {
    flex: 1,
  },
  orderProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  orderCustomer: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  orderId: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textOnPrimary,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  placeholder: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 16,
    marginTop: 50,
  },
});