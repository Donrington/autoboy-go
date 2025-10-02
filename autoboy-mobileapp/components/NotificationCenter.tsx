import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

type NotificationType = 'order' | 'message' | 'swap' | 'system' | 'promotion';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #1001 has been shipped and is on its way!',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message about Wireless Headphones',
    timestamp: '4 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'swap',
    title: 'Swap Match Found',
    message: 'Someone wants to swap their iPhone for your Samsung Galaxy',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Security Alert',
    message: 'New login detected from a different device',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: '5',
    type: 'promotion',
    title: 'Premium Upgrade',
    message: 'Get 50% off Premium membership this week only!',
    timestamp: '3 days ago',
    read: true,
  },
];

export default function NotificationCenter({ visible, onClose }: { 
  visible: boolean; 
  onClose: () => void; 
}) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order': return 'cube-outline';
      case 'message': return 'chatbubble-outline';
      case 'swap': return 'swap-horizontal-outline';
      case 'system': return 'shield-outline';
      case 'promotion': return 'gift-outline';
      default: return 'notifications-outline';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationItem, !item.read && styles.unread]}
              onPress={() => markAsRead(item.id)}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={getNotificationIcon(item.type)} 
                  size={20} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.background,
    marginTop: 60,
    marginHorizontal: 20,
    borderRadius: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: {
    backgroundColor: colors.primarySoft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.muted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginLeft: 8,
  },
});