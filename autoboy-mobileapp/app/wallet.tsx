import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { UserWallet, WalletTransaction } from '../types';

const mockWallet: UserWallet = {
  userId: 'user1',
  balance: 125000,
  currency: 'NGN',
  escrowBalance: 45000,
  pendingBalance: 15000,
  totalEarnings: 850000,
  totalSpent: 725000,
  lastTransaction: '2024-01-16T14:30:00Z',
};

const mockTransactions: WalletTransaction[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'credit',
    amount: 150000,
    currency: 'NGN',
    description: 'Sale of iPhone 14 Pro',
    status: 'completed',
    referenceId: 'ORD-001',
    createdAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    type: 'escrow_hold',
    amount: 45000,
    currency: 'NGN',
    description: 'Escrow for MacBook purchase',
    status: 'pending',
    referenceId: 'ORD-002',
    createdAt: '2024-01-15T10:15:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    type: 'withdrawal',
    amount: 200000,
    currency: 'NGN',
    description: 'Bank transfer to GTBank',
    status: 'completed',
    createdAt: '2024-01-14T16:45:00Z',
  },
];

export default function WalletScreen() {
  const { theme } = useTheme();
  const [wallet] = useState<UserWallet>(mockWallet);
  const [transactions] = useState<WalletTransaction[]>(mockTransactions);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  const getTransactionIcon = (type: string) => {
    const icons = {
      credit: 'arrow-down-circle',
      debit: 'arrow-up-circle',
      escrow_hold: 'lock-closed',
      escrow_release: 'lock-open',
      refund: 'return-down-back',
      withdrawal: 'card'
    };
    return icons[type as keyof typeof icons] || 'swap-horizontal';
  };

  const getTransactionColor = (type: string) => {
    const colors = {
      credit: '#4ECDC4',
      debit: '#FF6B6B',
      escrow_hold: '#FFA726',
      escrow_release: '#4ECDC4',
      refund: '#45B7D1',
      withdrawal: '#96CEB4'
    };
    return colors[type as keyof typeof colors] || theme.textMuted;
  };

  const handleAddMoney = () => {
    Alert.alert('Add Money', 'Feature coming soon!');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Feature coming soon!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Wallet</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'overview' ? 'white' : theme.textMuted }]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'transactions' ? 'white' : theme.textMuted }]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <>
            {/* Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Ionicons name="eye-outline" size={20} color="white" />
              </View>
              <Text style={styles.balanceAmount}>₦{wallet.balance.toLocaleString()}</Text>
              <Text style={styles.balanceCurrency}>{wallet.currency}</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={handleAddMoney}
              >
                <Ionicons name="add-circle" size={24} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.text }]}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={handleWithdraw}
              >
                <Ionicons name="card" size={24} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.text }]}>Withdraw</Text>
              </TouchableOpacity>
            </View>

            {/* Balance Breakdown */}
            <View style={[styles.breakdownCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.breakdownTitle, { color: theme.text }]}>Balance Breakdown</Text>
              
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownInfo}>
                  <Ionicons name="wallet" size={20} color="#4ECDC4" />
                  <Text style={[styles.breakdownLabel, { color: theme.text }]}>Available</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: '#4ECDC4' }]}>
                  ₦{wallet.balance.toLocaleString()}
                </Text>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownInfo}>
                  <Ionicons name="lock-closed" size={20} color="#FFA726" />
                  <Text style={[styles.breakdownLabel, { color: theme.text }]}>In Escrow</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: '#FFA726' }]}>
                  ₦{wallet.escrowBalance.toLocaleString()}
                </Text>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownInfo}>
                  <Ionicons name="time" size={20} color="#45B7D1" />
                  <Text style={[styles.breakdownLabel, { color: theme.text }]}>Pending</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: '#45B7D1' }]}>
                  ₦{wallet.pendingBalance.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.statsTitle, { color: theme.text }]}>Wallet Statistics</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Earned</Text>
                  <Text style={[styles.statValue, { color: '#4ECDC4' }]}>
                    ₦{wallet.totalEarnings.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Spent</Text>
                  <Text style={[styles.statValue, { color: '#FF6B6B' }]}>
                    ₦{wallet.totalSpent.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'transactions' && (
          <View style={styles.transactionsContainer}>
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                style={[styles.transactionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Ionicons 
                      name={getTransactionIcon(transaction.type) as any} 
                      size={24} 
                      color={getTransactionColor(transaction.type)} 
                    />
                    <View style={styles.transactionDetails}>
                      <Text style={[styles.transactionDescription, { color: theme.text }]}>
                        {transaction.description}
                      </Text>
                      <Text style={[styles.transactionDate, { color: theme.textMuted }]}>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.amountText, 
                      { color: transaction.type === 'credit' || transaction.type === 'refund' ? '#4ECDC4' : '#FF6B6B' }
                    ]}>
                      {transaction.type === 'credit' || transaction.type === 'refund' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                    </Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: transaction.status === 'completed' ? '#4ECDC4' : '#FFA726' }
                    ]}>
                      <Text style={styles.statusText}>{transaction.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {transactions.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Transactions</Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  Your transaction history will appear here
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', margin: 16, borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  balanceCard: { padding: 24, borderRadius: 16, marginBottom: 20 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  balanceAmount: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
  balanceCurrency: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  actionsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  actionText: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  breakdownCard: { padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1 },
  breakdownTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  breakdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  breakdownInfo: { flexDirection: 'row', alignItems: 'center' },
  breakdownLabel: { fontSize: 14, marginLeft: 8 },
  breakdownAmount: { fontSize: 16, fontWeight: '600' },
  statsCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  statsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  transactionsContainer: {},
  transactionCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  transactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transactionDetails: { marginLeft: 12, flex: 1 },
  transactionDescription: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  transactionDate: { fontSize: 12 },
  transactionAmount: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: 'white', fontSize: 10, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});