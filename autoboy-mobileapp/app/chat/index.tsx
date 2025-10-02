import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function ChatScreen() {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm interested in your iPhone 15 Pro Max. Is it still available?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read'
    },
    {
      id: 2,
      text: "Yes, it's still available! It's in excellent condition with 98% battery health.",
      sender: 'other',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read'
    },
    {
      id: 3,
      text: "Great! Can you share more photos of the device?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read'
    },
    {
      id: 4,
      text: "Sure! Let me send you some detailed photos.",
      sender: 'other',
      timestamp: new Date(Date.now() - 3300000),
      status: 'read'
    },
    {
      id: 5,
      text: "📷 Photo",
      sender: 'other',
      timestamp: new Date(Date.now() - 3200000),
      status: 'read',
      isImage: true,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop'
    },
    {
      id: 6,
      text: "Perfect! What's your best price?",
      sender: 'me',
      timestamp: new Date(Date.now() - 1800000),
      status: 'delivered'
    },
    {
      id: 7,
      text: "I can do ₦820,000 for you. That's my final price.",
      sender: 'other',
      timestamp: new Date(Date.now() - 1200000),
      status: 'read'
    },
    {
      id: 8,
      text: "Deal! How do we proceed with the transaction?",
      sender: 'me',
      timestamp: new Date(Date.now() - 600000),
      status: 'sent'
    }
  ]);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const seller = {
    name: 'TechHub Lagos',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    verified: true,
    lastSeen: 'Active now'
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newMessage = {
        id: messages.length + 1,
        text: message.trim(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sending'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate message sent
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, 1000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const MessageBubble = ({ msg }: { msg: any }) => {
    const isMe = msg.sender === 'me';
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {msg.isImage ? (
          <View style={[styles.imageBubble, { backgroundColor: isMe ? theme.primary : theme.backgroundAlt }]}>
            <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} />
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.8)' : theme.textMuted }]}>
                {formatTime(msg.timestamp)}
              </Text>
              {isMe && (
                <Ionicons 
                  name={msg.status === 'read' ? 'checkmark-done' : msg.status === 'delivered' ? 'checkmark-done' : 'checkmark'} 
                  size={14} 
                  color={msg.status === 'read' ? '#4CAF50' : 'rgba(255,255,255,0.8)'} 
                />
              )}
            </View>
          </View>
        ) : (
          <View style={[
            styles.messageBubble,
            {
              backgroundColor: isMe ? theme.primary : theme.backgroundAlt,
              borderBottomRightRadius: isMe ? 8 : 20,
              borderBottomLeftRadius: isMe ? 20 : 8,
            }
          ]}>
            <Text style={[
              styles.messageText,
              { color: isMe ? 'white' : theme.text }
            ]}>
              {msg.text}
            </Text>
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.8)' : theme.textMuted }]}>
                {formatTime(msg.timestamp)}
              </Text>
              {isMe && (
                <Ionicons 
                  name={msg.status === 'read' ? 'checkmark-done' : msg.status === 'delivered' ? 'checkmark-done' : 'checkmark'} 
                  size={14} 
                  color={msg.status === 'read' ? '#4CAF50' : 'rgba(255,255,255,0.8)'} 
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
          <View style={styles.sellerInfo}>
            <View style={styles.sellerNameRow}>
              <Text style={[styles.sellerName, { color: theme.text }]}>{seller.name}</Text>
              {seller.verified && (
                <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
              )}
            </View>
            <View style={styles.statusRow}>
              {seller.isOnline && <View style={styles.onlineIndicator} />}
              <Text style={[styles.lastSeen, { color: theme.textMuted }]}>{seller.lastSeen}</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="videocam-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="call-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={[styles.quickActions, { backgroundColor: theme.backgroundAlt }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContent}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.primaryGlow }]}>
            <Ionicons name="card-outline" size={16} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.primary }]}>Make Offer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.warningGlow }]}>
            <Ionicons name="swap-horizontal" size={16} color={theme.warning} />
            <Text style={[styles.quickActionText, { color: theme.warning }]}>Swap Deal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.successGlow }]}>
            <Ionicons name="shield-checkmark" size={16} color={theme.success} />
            <Text style={[styles.quickActionText, { color: theme.success }]}>Escrow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.primaryGlow }]}>
            <Ionicons name="location-outline" size={16} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.primary }]}>Meet Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Input */}
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.emojiBtn}>
            <Ionicons name="happy-outline" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: message.trim() ? theme.primary : theme.border }]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 15,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  lastSeen: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  headerBtn: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  imageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  quickActions: {
    paddingVertical: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    maxHeight: 80,
  },
  emojiBtn: {
    padding: 5,
    marginLeft: 5,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});