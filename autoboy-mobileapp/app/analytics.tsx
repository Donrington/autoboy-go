import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: '90d', name: '3 Months' },
    { id: '1y', name: '1 Year' }
  ];

  const stats = {
    totalRevenue: 2150000,
    totalOrders: 45,
    avgOrderValue: 47777,
    conversionRate: 12.5,
    topProduct: 'iPhone 15 Pro Max',
    topCategory: 'Smartphones'
  };

  const chartData = [
    { day: 'Mon', sales: 150000, orders: 3 },
    { day: 'Tue', sales: 280000, orders: 6 },
    { day: 'Wed', sales: 420000, orders: 8 },
    { day: 'Thu', sales: 320000, orders: 7 },
    { day: 'Fri', sales: 580000, orders: 12 },
    { day: 'Sat', sales: 250000, orders: 5 },
    { day: 'Sun', sales: 150000, orders: 4 }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 8, revenue: 680000, trend: 'up' },
    { name: 'MacBook Air M2', sales: 5, revenue: 375000, trend: 'up' },
    { name: 'iPad Pro 11"', sales: 4, revenue: 180000, trend: 'down' },
    { name: 'AirPods Pro 2', sales: 6, revenue: 108000, trend: 'up' }
  ];

  const maxSales = Math.max(...chartData.map(d => d.sales));

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundAlt }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend === 'up' ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={trend === 'up' ? theme.success : theme.error} 
            />
            <Text style={[
              styles.trendText,
              { color: trend === 'up' ? theme.success : theme.error }
            ]}>
              {trend === 'up' ? '+12%' : '-5%'}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.textMuted }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  );

  const ChartBar = ({ data, index }: { data: any; index: number }) => {
    const height = (data.sales / maxSales) * 100;
    return (
      <View style={styles.chartBar} key={index}>
        <View style={styles.barContainer}>
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={[styles.bar, { height: `${height}%` }]}
          />
        </View>
        <Text style={[styles.barLabel, { color: theme.textMuted }]}>{data.day}</Text>
        <Text style={[styles.barValue, { color: theme.text }]}>
          ₦{(data.sales / 1000).toFixed(0)}K
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sales Analytics</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <Ionicons name="download-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodBtn,
                {
                  backgroundColor: selectedPeriod === period.id ? theme.primary : theme.backgroundAlt,
                  borderColor: selectedPeriod === period.id ? theme.primary : theme.border
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPeriod(period.id);
              }}
            >
              <Text style={[
                styles.periodText,
                { color: selectedPeriod === period.id ? 'white' : theme.text }
              ]}>
                {period.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Revenue"
            value={`₦${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            icon="trending-up"
            color={theme.success}
            trend="up"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="receipt"
            color={theme.primary}
            trend="up"
          />
          <StatCard
            title="Avg Order Value"
            value={`₦${(stats.avgOrderValue / 1000).toFixed(0)}K`}
            icon="calculator"
            color={theme.warning}
            trend="down"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon="target"
            color={theme.error}
            trend="up"
          />
        </View>

        {/* Sales Chart */}
        <View style={[styles.chartSection, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sales Overview</Text>
          <View style={styles.chart}>
            {chartData.map((data, index) => (
              <ChartBar key={index} data={data} index={index} />
            ))}
          </View>
        </View>

        {/* Top Products */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Performing Products</Text>
          {topProducts.map((product, index) => (
            <View key={index} style={[styles.productRow, { borderBottomColor: theme.border }]}>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
                <Text style={[styles.productStats, { color: theme.textMuted }]}>
                  {product.sales} sales • ₦{(product.revenue / 1000).toFixed(0)}K revenue
                </Text>
              </View>
              <View style={styles.productTrend}>
                <Ionicons 
                  name={product.trend === 'up' ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={product.trend === 'up' ? theme.success : theme.error} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Performance Insights */}
        <View style={[styles.section, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={16} color={theme.success} />
              <Text style={[styles.insightText, { color: theme.textMuted }]}>
                Sales increased by 25% compared to last week
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="star" size={16} color={theme.warning} />
              <Text style={[styles.insightText, { color: theme.textMuted }]}>
                {stats.topProduct} is your best-selling product
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="time" size={16} color={theme.primary} />
              <Text style={[styles.insightText, { color: theme.textMuted }]}>
                Peak sales time is between 2-6 PM
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="people" size={16} color={theme.error} />
              <Text style={[styles.insightText, { color: theme.textMuted }]}>
                Customer retention rate is 78%
              </Text>
            </View>
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
  exportBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
  },
  chartSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productStats: {
    fontSize: 12,
  },
  productTrend: {
    padding: 4,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
  },
});