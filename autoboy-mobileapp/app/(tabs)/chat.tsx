
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { mockConversations } from '../../data/products';
import { Ionicons } from '@expo/vector-icons';
import NotificationCenter from '../../components/NotificationCenter';
import PremiumBadge from '../../components/PremiumBadge';
import websocketService from '../../services/websocketService';
import { Conversation } from '../../types';

export default function ChatListScreen() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(
    mockConversations.map(conv => ({
      id: conv.id,
      participants: [conv.id, 'current_user'],
      type: 'direct' as const,
      title: conv.title,
      lastMessage: { sender: 'them' as const, text: conv.lastMessage },
      unreadCount: 2,
      isArchived: false,
      isMuted: false
    }))
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket connection status
    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);

    // Real-time message updates
    const handleNewMessage = (message: any) => {
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversation_id 
          ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
          : conv
      ));
    };

    websocketService.on('connection', handleConnection);
    websocketService.on('disconnection', handleDisconnection);
    websocketService.on('new_message', handleNewMessage);

    // Initial connection state
    setIsConnected(websocketService.isConnected());

    return () => {
      websocketService.off('connection', handleConnection);
      websocketService.off('disconnection', handleDisconnection);
      websocketService.off('new_message', handleNewMessage);
    };
  }, []);

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#4ECDC4' : '#FF6B6B' }]}>
            <Text style={styles.connectionText}>{isConnected ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.title.charAt(0)}</Text>
              </View>
              <PremiumBadge verified={true} size="small" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.last}>{item.lastMessage?.text || 'No messages yet'}</Text>
              <Text style={styles.timestamp}>2 hours ago</Text>
            </View>
            <View style={styles.rightSection}>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>2</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
      
      <NotificationCenter 
        visible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  connectionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  item: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  last: {
    color: colors.muted,
    marginBottom: 2,
  },
  timestamp: {
    color: colors.muted,
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
