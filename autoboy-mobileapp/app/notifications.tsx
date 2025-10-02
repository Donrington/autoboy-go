import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All', count: 12 },
    { id: 'orders', name: 'Orders', count: 5 },
    { id: 'messages', name: 'Messages', count: 3 },
    { id: 'promotions', name: 'Promotions', count: 4 }
  ];

  const notifications = [
    {
      id: '1',
      type: 'order',
      title: 'Order Completed',
      message: 'Your iPhone 15 Pro Max has been delivered successfully',
      time: '2 minutes ago',
      read: false,
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=50&h=50&fit=crop'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'TechHub Lagos sent you a message about your inquiry',
      time: '15 minutes ago',
      read: false,
      icon: 'chatbubble',
      iconColor: '#2196F3',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Flash Sale Alert!',
      message: '50% off on all MacBooks. Limited time offer!',
      time: '1 hour ago',
      read: true,
      icon: 'flash',
      iconColor: '#FF9800',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=50&h=50&fit=crop'
    },
    {
      id: '4',
      type: 'order',
      title: 'Payment Received',
      message: 'You received ₦850,000 for iPhone 15 Pro Max',
      time: '2 hours ago',
      read: true,
      icon: 'card',
      iconColor: '#4CAF50'
    },
    {
      id: '5',
      type: 'swap',
      title: 'Swap Request',
      message: 'John Doe wants to swap iPad Pro for your MacBook',
      time: '3 hours ago',
      read: false,
      icon: 'swap-horizontal',
      iconColor: '#9C27B0',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=50&h=50&fit=crop'
    },
    {
      id: '6',
      type: 'system',
      title: 'Account Verified',
      message: 'Your seller account has been successfully verified',
      time: '1 day ago',
      read: true,
      icon: 'shield-checkmark',
      iconColor: '#4CAF50'
    }
  ];

  const markAsRead = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Mark notification as read logic
  };

  const markAllAsRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Mark all notifications as read logic
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return 'receipt';
      case 'message': return 'chatbubble';
      case 'promotion': return 'pricetag';
      case 'swap': return 'swap-horizontal';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const NotificationCard = ({ notification }: { notification: any }) => (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        {
          backgroundColor: notification.read ? theme.backgroundAlt : theme.primaryGlow,
          borderColor: notification.read ? theme.border : theme.primary
        }
      ]}
      onPress={() => markAsRead(notification.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          {notification.image || notification.avatar ? (
            <Image 
              source={{ uri: notification.image || notification.avatar }} 
              style={[
                styles.notificationImage,
                notification.avatar && styles.avatarImage
              ]} 
            />
          ) : (
            <View style={[styles.notificationIcon, { backgroundColor: notification.iconColor + '20' }]}>
              <Ionicons name={notification.icon} size={20} color={notification.iconColor} />
            </View>
          )}
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, { color: theme.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationMessage, { color: theme.textMuted }]} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
              {notification.time}
            </Text>
          </View>
        </View>
        <View style={styles.notificationRight}>
          {!notification.read && (
            <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
          )}
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
          <Text style={[styles.markAllText, { color: theme.primary }]}>Mark All</Text>
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
              <Ionicons 
                name={getTypeIcon(filter.id)} 
                size={16} 
                color={selectedFilter === filter.id ? 'white' : theme.textMuted} 
              />
              <Text style={[
                styles.filterTabText,
                { color: selectedFilter === filter.id ? 'white' : theme.text }
              ]}>
                {filter.name}
              </Text>
              {filter.count > 0 && (
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
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: theme.backgroundAlt }]}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="settings-outline" size={20} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>Notification Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>Snooze All</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Notifications</Text>
            <Text style={[styles.unreadCount, { color: theme.primary }]}>
              {notifications.filter(n => !n.read).length} unread
            </Text>
          </View>
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </View>

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Notifications</Text>
            <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}
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
  markAllBtn: {
    padding: 5,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    gap: 6,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 20,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    paddingHorizontal: 20,
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
  unreadCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  avatarImage: {
    borderRadius: 20,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationRight: {
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});