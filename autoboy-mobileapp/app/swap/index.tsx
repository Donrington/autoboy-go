import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SwapDeal } from '../../types';

const mockSwapDeals: SwapDeal[] = [
  {
    id: '1',
    fromUserId: 'user1',
    toUserId: 'user2',
    fromItemId: 'item1',
    toItemId: 'item2',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    fromUserId: 'user3',
    toUserId: 'user1',
    fromItemId: 'item3',
    toItemId: 'item4',
    status: 'accepted',
    createdAt: '2024-01-10T14:20:00Z',
  },
];

const mockItems = {
  item1: { title: 'iPhone 14 Pro', image: '📱', value: 800000 },
  item2: { title: 'Samsung Galaxy S24', image: '📱', value: 750000 },
  item3: { title: 'MacBook Air M2', image: '💻', value: 1200000 },
  item4: { title: 'iPad Pro 12.9"', image: '📱', value: 900000 },
};

export default function SwapScreen() {
  const { theme } = useTheme();
  const [swapDeals, setSwapDeals] = useState<SwapDeal[]>(mockSwapDeals);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'accepted': return '#4ECDC4';
      case 'rejected': return '#FF6B6B';
      case 'completed': return '#45B7D1';
      default: return theme.textMuted;
    }
  };

  const handleSwapAction = (swapId: string, action: 'accept' | 'reject') => {
    Alert.alert(
      `${action === 'accept' ? 'Accept' : 'Reject'} Swap`,
      `Are you sure you want to ${action} this swap offer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'accept' ? 'Accept' : 'Reject',
          onPress: () => {
            setSwapDeals(prev => prev.map(swap => 
              swap.id === swapId ? { ...swap, status: action === 'accept' ? 'accepted' : 'rejected' } : swap
            ));
          }
        }
      ]
    );
  };

  const filteredDeals = swapDeals.filter(deal => 
    activeTab === 'sent' ? deal.fromUserId === 'user1' : deal.toUserId === 'user1'
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Swap Deals</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'received' ? 'white' : theme.textMuted }]}>
            Received ({swapDeals.filter(d => d.toUserId === 'user1').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'sent' ? 'white' : theme.textMuted }]}>
            Sent ({swapDeals.filter(d => d.fromUserId === 'user1').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredDeals.map((deal) => {
          const fromItem = mockItems[deal.fromItemId as keyof typeof mockItems];
          const toItem = mockItems[deal.toItemId as keyof typeof mockItems];
          const isReceived = activeTab === 'received';
          
          return (
            <View
              key={deal.id}
              style={[styles.swapCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.swapHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deal.status) }]}>
                  <Text style={styles.statusText}>{deal.status.toUpperCase()}</Text>
                </View>
                <Text style={[styles.swapDate, { color: theme.textMuted }]}>
                  {new Date(deal.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.swapContent}>
                <View style={styles.itemContainer}>
                  <Text style={[styles.itemLabel, { color: theme.textMuted }]}>
                    {isReceived ? 'You give' : 'You offered'}
                  </Text>
                  <View style={styles.itemCard}>
                    <Text style={styles.itemEmoji}>{isReceived ? toItem?.image : fromItem?.image}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                        {isReceived ? toItem?.title : fromItem?.title}
                      </Text>
                      <Text style={[styles.itemValue, { color: theme.primary }]}>
                        ₦{(isReceived ? toItem?.value : fromItem?.value)?.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.swapIcon}>
                  <Ionicons name="swap-horizontal" size={24} color={theme.primary} />
                </View>

                <View style={styles.itemContainer}>
                  <Text style={[styles.itemLabel, { color: theme.textMuted }]}>
                    {isReceived ? 'You get' : 'They offered'}
                  </Text>
                  <View style={styles.itemCard}>
                    <Text style={styles.itemEmoji}>{isReceived ? fromItem?.image : toItem?.image}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                        {isReceived ? fromItem?.title : toItem?.title}
                      </Text>
                      <Text style={[styles.itemValue, { color: theme.primary }]}>
                        ₦{(isReceived ? fromItem?.value : toItem?.value)?.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {deal.status === 'pending' && isReceived && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleSwapAction(deal.id, 'reject')}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleSwapAction(deal.id, 'accept')}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {filteredDeals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="swap-horizontal-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Swap Deals</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {activeTab === 'received' 
                ? "You haven't received any swap offers yet" 
                : "You haven't sent any swap offers yet"}
            </Text>
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
  swapCard: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  swapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  swapDate: { fontSize: 12 },
  swapContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemContainer: { flex: 1 },
  itemLabel: { fontSize: 12, marginBottom: 8, textAlign: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  itemEmoji: { fontSize: 32, marginRight: 8 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemValue: { fontSize: 12, fontWeight: '500' },
  swapIcon: { paddingHorizontal: 16 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  rejectButton: { backgroundColor: '#FF6B6B' },
  acceptButton: {},
  rejectButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  acceptButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});