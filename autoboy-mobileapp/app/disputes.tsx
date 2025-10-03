import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Dispute } from '../types';

const mockDisputes: Dispute[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    productId: 'PROD-001',
    buyerId: 'user1',
    sellerId: 'user2',
    reason: 'not_received',
    description: 'Paid for iPhone but never received it. Seller not responding.',
    status: 'open',
    disputedAmount: 850000,
    evidenceCount: 3,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    orderId: 'ORD-002',
    productId: 'PROD-002',
    buyerId: 'user1',
    sellerId: 'user3',
    reason: 'damaged',
    description: 'MacBook arrived with cracked screen.',
    status: 'under_review',
    disputedAmount: 1200000,
    evidenceCount: 5,
    createdAt: '2024-01-10T14:20:00Z',
  },
];

export default function DisputesScreen() {
  const { theme } = useTheme();
  const [disputes] = useState<Dispute[]>(mockDisputes);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#FF6B6B';
      case 'under_review': return '#4ECDC4';
      case 'resolved': return '#45B7D1';
      case 'closed': return '#96CEB4';
      default: return theme.textMuted;
    }
  };

  const getReasonText = (reason: string) => {
    const reasons = {
      'not_received': 'Item Not Received',
      'damaged': 'Item Damaged',
      'not_as_described': 'Not As Described',
      'counterfeit': 'Counterfeit Item',
      'wrong_item': 'Wrong Item',
      'refund_issue': 'Refund Issue',
      'other': 'Other'
    };
    return reasons[reason as keyof typeof reasons] || reason;
  };

  const handleDisputePress = (dispute: Dispute) => {
    Alert.alert('Dispute Details', `Order: ${dispute.orderId}\nStatus: ${dispute.status}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Disputes</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {disputes.map((dispute) => (
          <TouchableOpacity
            key={dispute.id}
            style={[styles.disputeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleDisputePress(dispute)}
          >
            <View style={styles.disputeHeader}>
              <View>
                <Text style={[styles.orderId, { color: theme.text }]}>Order #{dispute.orderId}</Text>
                <Text style={[styles.reason, { color: theme.textMuted }]}>{getReasonText(dispute.reason)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) }]}>
                <Text style={styles.statusText}>{dispute.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>

            <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
              {dispute.description}
            </Text>

            <View style={styles.disputeFooter}>
              <Text style={[styles.amount, { color: theme.primary }]}>
                ₦{dispute.disputedAmount.toLocaleString()}
              </Text>
              <View style={styles.evidenceInfo}>
                <Ionicons name="document-outline" size={16} color={theme.textMuted} />
                <Text style={[styles.evidenceCount, { color: theme.textMuted }]}>
                  {dispute.evidenceCount} evidence
                </Text>
              </View>
            </View>

            <Text style={[styles.date, { color: theme.textMuted }]}>
              Created {new Date(dispute.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}

        {disputes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Disputes</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              You haven't raised any disputes yet
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
  content: { flex: 1, padding: 20 },
  disputeCard: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '600' },
  reason: { fontSize: 14, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: 'white', fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  disputeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  amount: { fontSize: 16, fontWeight: '600' },
  evidenceInfo: { flexDirection: 'row', alignItems: 'center' },
  evidenceCount: { fontSize: 12, marginLeft: 4 },
  date: { fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
});