import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export default function SupportChat() {
  const { theme, isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to AutoBoy Support. How can I help you today?',
      isUser: false,
      timestamp: new Date(Date.now() - 60000),
      status: 'read'
    },
    {
      id: '2',
      text: 'I have a question about my recent order',
      isUser: true,
      timestamp: new Date(Date.now() - 30000),
      status: 'read'
    },
    {
      id: '3',
      text: 'I\'d be happy to help you with your order. Could you please provide your order number?',
      isUser: false,
      timestamp: new Date(Date.now() - 15000),
      status: 'read'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickReplies = [
    'Order Status',
    'Payment Issue',
    'Refund Request',
    'Product Question',
    'Account Help',
    'Technical Support'
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. Let me check that for you right away.',
        isUser: false,
        timestamp: new Date(),
        status: 'read'
      };
      setMessages(prev => [...prev, supportResponse]);
    }, 2000);
  };

  const sendQuickReply = (reply: string) => {
    setMessage(reply);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const MessageBubble = ({ message: msg }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      msg.isUser ? styles.userMessage : styles.supportMessage
    ]}>
      <BlurView 
        intensity={20} 
        tint={msg.isUser ? 'light' : (isDark ? 'dark' : 'light')} 
        style={[
          styles.messageContent,
          {
            backgroundColor: msg.isUser 
              ? theme.primary + '90' 
              : theme.backgroundAlt + '80'
          }
        ]}
      >
        <Text style={[
          styles.messageText,
          { color: msg.isUser ? 'white' : theme.text }
        ]}>
          {msg.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            { color: msg.isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted }
          ]}>
            {formatTime(msg.timestamp)}
          </Text>
          {msg.isUser && msg.status && (
            <View style={styles.messageStatus}>
              {msg.status === 'sending' && (
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
              )}
              {msg.status === 'sent' && (
                <Ionicons name="checkmark" size={12} color="rgba(255,255,255,0.7)" />
              )}
              {msg.status === 'delivered' && (
                <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.7)" />
              )}
              {msg.status === 'read' && (
                <Ionicons name="checkmark-done" size={12} color="#4CAF50" />
              )}
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <BlurView intensity={20} tint="light" style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AutoBoy Support</Text>
            <View style={styles.statusContainer}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.statusText}>Online • Avg response 2 min</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isTyping && (
          <View style={[styles.messageBubble, styles.supportMessage]}>
            <BlurView 
              intensity={20} 
              tint={isDark ? 'dark' : 'light'} 
              style={[styles.messageContent, { backgroundColor: theme.backgroundAlt + '80' }]}
            >
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
                <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
                <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
              </View>
            </BlurView>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickRepliesContainer}
        contentContainerStyle={styles.quickRepliesContent}
      >
        {quickReplies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.quickReplyButton, { backgroundColor: theme.backgroundAlt + '80' }]}
            onPress={() => sendQuickReply(reply)}
          >
            <Text style={[styles.quickReplyText, { color: theme.text }]}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input Area */}
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.inputContainer, { backgroundColor: theme.backgroundAlt + '80' }]}>
        <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              { 
                backgroundColor: message.trim() ? theme.primary : theme.textMuted,
                opacity: message.trim() ? 1 : 0.5 
              }
            ]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  moreButton: {
    marginLeft: 16,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageBubble: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  supportMessage: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  quickRepliesContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickRepliesContent: {
    paddingRight: 20,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachButton: {
    marginRight: 8,
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});