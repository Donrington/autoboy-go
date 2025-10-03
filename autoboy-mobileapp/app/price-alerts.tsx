import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { PriceAlert } from '../types';

const mockAlerts: PriceAlert[] = [
  {
    id: '1',
    productId: 'prod1',
    userId: 'user1',
    targetPrice: 800000,
    alertType: 'price_drop',
    isActive: true,
    notificationMethod: 'both',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    productId: 'prod2',
    userId: 'user1',
    targetPrice: 1200000,
    alertType: 'back_in_stock',
    isActive: false,
    notificationMethod: 'push',
    createdAt: '2024-01-10T14:20:00Z',
    triggeredAt: '2024-01-16T09:15:00Z',
  },
];

const mockProducts = {
  prod1: { title: 'iPhone 15 Pro Max', currentPrice: 1200000, image: '📱' },
  prod2: { title: 'MacBook Pro M3', currentPrice: 2500000, image: '💻' },
};

export default function PriceAlertsScreen() {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockAlerts);

  const toggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this price alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        }
      ]
    );
  };

  const getAlertTypeText = (type: string) => {
    const types = {
      'price_drop': 'Price Drop',
      'price_increase': 'Price Increase',
      'back_in_stock': 'Back in Stock'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      'price_drop': 'trending-down',
      'price_increase': 'trending-up',
      'back_in_stock': 'cube'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  };

  const createNewAlert = () => {
    Alert.alert('Create Alert', 'Navigate to a product page to create a price alert');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Price Alerts</Text>
        <TouchableOpacity onPress={createNewAlert}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Alerts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Alerts</Text>
          {alerts.filter(alert => alert.isActive).map((alert) => {
            const product = mockProducts[alert.productId as keyof typeof mockProducts];
            return (
              <View
                key={alert.id}
                style={[styles.alertCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.alertHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productEmoji}>{product?.image}</Text>
                    <View style={styles.productDetails}>
                      <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>
                        {product?.title}
                      </Text>
                      <View style={styles.alertTypeContainer}>
                        <Ionicons 
                          name={getAlertIcon(alert.alertType) as any} 
                          size={14} 
                          color={theme.primary} 
                        />
                        <Text style={[styles.alertType, { color: theme.primary }]}>
                          {getAlertTypeText(alert.alertType)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Switch
                    value={alert.isActive}
                    onValueChange={() => toggleAlert(alert.id)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={alert.isActive ? 'white' : theme.textMuted}
                  />
                </View>

                <View style={styles.priceInfo}>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Target Price:</Text>
                    <Text style={[styles.targetPrice, { color: theme.primary }]}>
                      ₦{alert.targetPrice.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Current Price:</Text>
                    <Text style={[styles.currentPrice, { color: theme.text }]}>
                      ₦{product?.currentPrice.toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.alertFooter}>
                  <View style={styles.notificationInfo}>
                    <Ionicons 
                      name={alert.notificationMethod === 'email' ? 'mail' : alert.notificationMethod === 'push' ? 'notifications' : 'notifications'} 
                      size={14} 
                      color={theme.textMuted} 
                    />
                    <Text style={[styles.notificationText, { color: theme.textMuted }]}>
                      {alert.notificationMethod === 'both' ? 'Email & Push' : alert.notificationMethod}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAlert(alert.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Triggered Alerts */}
        {alerts.some(alert => alert.triggeredAt) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Triggers</Text>
            {alerts.filter(alert => alert.triggeredAt).map((alert) => {
              const product = mockProducts[alert.productId as keyof typeof mockProducts];
              return (
                <View
                  key={alert.id}
                  style={[styles.alertCard, { backgroundColor: theme.surface, borderColor: '#4ECDC4', opacity: 0.8 }]}
                >
                  <View style={styles.triggeredHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    <Text style={[styles.triggeredText, { color: '#4ECDC4' }]}>Alert Triggered</Text>
                  </View>
                  <Text style={[styles.productTitle, { color: theme.text }]}>{product?.title}</Text>
                  <Text style={[styles.triggeredDate, { color: theme.textMuted }]}>
                    {alert.triggeredAt && new Date(alert.triggeredAt).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {alerts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Price Alerts</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Create alerts to get notified when prices drop or items come back in stock
            </Text>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={createNewAlert}
            >
              <Text style={styles.createButtonText}>Create Your First Alert</Text>
            </TouchableOpacity>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  alertCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productEmoji: { fontSize: 32, marginRight: 12 },
  productDetails: { flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  alertTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  alertType: { fontSize: 12, fontWeight: '500', marginLeft: 4 },
  priceInfo: { marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  priceLabel: { fontSize: 14 },
  targetPrice: { fontSize: 14, fontWeight: '600' },
  currentPrice: { fontSize: 14, fontWeight: '600' },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationInfo: { flexDirection: 'row', alignItems: 'center' },
  notificationText: { fontSize: 12, marginLeft: 4 },
  triggeredHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  triggeredText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  triggeredDate: { fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  createButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});