import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useState } from 'react';
import { mockMessages } from '../../data/products';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState(mockMessages[conversationId as string] || []);
  const [input, setInput] = useState('');

  // Mock contact info
  const contact = {
    name: 'TechHub Lagos',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isOnline: true,
    lastSeen: 'Active now'
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          <Image source={{ uri: contact.avatar }} style={styles.avatar} />
          <View style={styles.contactDetails}>
            <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
            <View style={styles.statusRow}>
              {contact.isOnline && <View style={styles.onlineIndicator} />}
              <Text style={[styles.lastSeen, { color: theme.textMuted }]}>{contact.lastSeen}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.chatContainer}>
      <FlatList
        data={messages}
        keyExtractor={(item, idx) => `${item.sender}-${idx}`}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'me' ? styles.me : styles.them]}>
            <Text style={[styles.text, item.sender === 'me' ? styles.textOnPrimary : styles.textOnSurface]}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message"
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            if (!input.trim()) return console.log('Empty message');
            const next = [...messages, { sender: 'me' as const, text: input.trim() }];
            setMessages(next);
            setInput('');
          }}
        >
          <Ionicons name="send" size={20} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    gap: 12,
  },
  backBtn: {
    padding: 5,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
    backgroundColor: '#22C55E',
  },
  lastSeen: {
    fontSize: 12,
  },
  moreBtn: {
    padding: 5,
  },
  chatContainer: {
    flex: 1,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  them: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontWeight: '500',
  },
  textOnPrimary: {
    color: colors.textOnPrimary,
  },
  textOnSurface: {
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
  },
});
