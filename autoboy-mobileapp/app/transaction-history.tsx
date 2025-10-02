import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function TransactionHistory() {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All', count: 28 },
    { id: 'completed', name: 'Completed', count: 22 },
    { id: 'pending', name: 'Pending', count: 4 },
    { id: 'cancelled', name: 'Cancelled', count: 2 }
  ];

  const transactions = [
    {
      id: '1',
      type: 'sale',
      product: 'iPhone 15 Pro Max',
      buyer: 'John Doe',
      amount: 850000,
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=60&h=60&fit=crop',
      transactionId: 'TXN001234'
    },
    {
      id: '2',
      type: 'purchase',
      product: 'MacBook Air M2',
      seller: 'TechStore Lagos',
      amount: 750000,
      status: 'pending',
      date: '2024-01-14T15:45:00Z',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&h=60&fit=crop',
      transactionId: 'TXN001235'
    },
    {
      id: '3',
      type: 'swap',
      product: 'iPad Pro 11"',
      swapWith: 'Samsung Galaxy Tab S9',
      partner: 'Mike Johnson',
      amount: 0,
      status: 'completed',
      date: '2024-01-13T09:20:00Z',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=60&h=60&fit=crop',
      transactionId: 'SWP001236'
    },
    {
      id: '4',
      type: 'sale',
      product: 'AirPods Pro 2',
      buyer: 'Sarah Wilson',
      amount: 180000,
      status: 'cancelled',
      date: '2024-01-12T14:15:00Z',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=60&h=60&fit=crop',
      transactionId: 'TXN001237'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'pending': return theme.warning;
      case 'cancelled': return theme.error;
      default: return theme.textMuted;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return 'trending-up';
      case 'purchase': return 'trending-down';
      case 'swap': return 'swap-horizontal';
      default: return 'receipt';
    }
  };

  const TransactionCard = ({ transaction }: { transaction: any }) => (
    <TouchableOpacity 
      style={[styles.transactionCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <Image source={{ uri: transaction.image }} style={styles.productImage} />
          <View style={styles.transactionInfo}>
            <Text style={[styles.productName, { color: theme.text }]}>{transaction.product}</Text>
            <View style={styles.transactionMeta}>
              <Ionicons name={getTypeIcon(transaction.type)} size={12} color={theme.textMuted} />
              <Text style={[styles.transactionType, { color: theme.textMuted }]}>
                {transaction.type === 'sale' ? `Sold to ${transaction.buyer}` :
                 transaction.type === 'purchase' ? `Bought from ${transaction.seller}` :
                 `Swapped with ${transaction.partner}`}
              </Text>
            </View>
            <Text style={[styles.transactionDate, { color: theme.textMuted }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          {transaction.amount > 0 && (
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'sale' ? theme.success : theme.primary }
            ]}>
              {transaction.type === 'sale' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
            </Text>
          )}
          {transaction.type === 'swap' && (
            <Text style={[styles.swapText, { color: theme.warning }]}>SWAP</Text>
          )}
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(transaction.status) + '20' }
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionFooter}>
        <Text style={[styles.transactionId, { color: theme.textMuted }]}>
          ID: {transaction.transactionId}
        </Text>
        <TouchableOpacity style={styles.viewDetailsBtn}>
          <Text style={[styles.viewDetailsText, { color: theme.primary }]}>View Details</Text>
          <Ionicons name="chevron-forward" size={12} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Transaction History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedFilter === filter.id ? theme.primary : theme.backgroundAlt,
                  borderColor: selectedFilter === filter.id ? theme.primary : theme.border
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filter.id);
              }}
            >
              <Text style={[
                styles.filterTabText,
                { color: selectedFilter === filter.id ? 'white' : theme.text }
              ]}>
                {filter.name}
              </Text>
              <View style={[
                styles.filterCount,
                {
                  backgroundColor: selectedFilter === filter.id ? 'rgba(255,255,255,0.2)' : theme.primaryGlow
                }
              ]}>
                <Text style={[
                  styles.filterCountText,
                  { color: selectedFilter === filter.id ? 'white' : theme.primary }
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Stats */}
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundAlt }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.success }]}>+₦2.1M</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Earned</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.error }]}>-₦850K</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Spent</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.primary }]}>₦1.25M</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Net Balance</Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
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
  filterBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    gap: 8,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 12,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  swapText: {
    fontSize: 12,
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
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  transactionId: {
    fontSize: 12,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});