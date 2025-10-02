import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Session {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  browser?: string;
  os: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
}

export default function ActiveSessions() {
  const { theme, isDark } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'iPhone 15 Pro',
      location: 'Lagos, Nigeria',
      ipAddress: '197.210.xxx.xxx',
      lastActive: 'Active now',
      isCurrent: true,
      os: 'iOS 17.2',
      deviceType: 'mobile',
    },
    {
      id: '2',
      device: 'MacBook Pro',
      location: 'Lagos, Nigeria',
      ipAddress: '197.210.xxx.xxx',
      lastActive: '2 hours ago',
      isCurrent: false,
      browser: 'Safari 17.1',
      os: 'macOS Sonoma',
      deviceType: 'desktop',
    },
    {
      id: '3',
      device: 'Samsung Galaxy S24',
      location: 'Abuja, Nigeria',
      ipAddress: '105.112.xxx.xxx',
      lastActive: '1 day ago',
      isCurrent: false,
      os: 'Android 14',
      deviceType: 'mobile',
    },
    {
      id: '4',
      device: 'iPad Air',
      location: 'Port Harcourt, Nigeria',
      ipAddress: '41.203.xxx.xxx',
      lastActive: '3 days ago',
      isCurrent: false,
      os: 'iPadOS 17.1',
      deviceType: 'tablet',
    },
  ]);

  const getDeviceIcon = (deviceType: string, os: string) => {
    if (deviceType === 'mobile') {
      return os.toLowerCase().includes('ios') ? 'phone-portrait' : 'phone-portrait';
    } else if (deviceType === 'tablet') {
      return 'tablet-portrait';
    } else {
      return 'desktop';
    }
  };

  const getDeviceColor = (isCurrent: boolean) => {
    return isCurrent ? theme.primary : theme.textMuted;
  };

  const terminateSession = (sessionId: string, deviceName: string) => {
    Alert.alert(
      'Terminate Session',
      `Are you sure you want to terminate the session on ${deviceName}? This will sign out the device immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(session => session.id !== sessionId));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Success', `Session on ${deviceName} has been terminated.`);
          }
        }
      ]
    );
  };

  const terminateAllOtherSessions = () => {
    Alert.alert(
      'Terminate All Other Sessions',
      'This will sign out all other devices except this one. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate All',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(session => session.isCurrent));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Alert.alert('Success', 'All other sessions have been terminated.');
          }
        }
      ]
    );
  };

  const refreshSessions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate refresh
    Alert.alert('Refreshed', 'Session list has been updated.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
          <Text style={styles.headerTitle}>Active Sessions</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshSessions}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Info */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.infoCard, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>Security Information</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            These are all the devices currently signed into your AutoBoy account. 
            If you see any unfamiliar devices, terminate them immediately and change your password.
          </Text>
        </BlurView>

        {/* Current Session */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Session</Text>
          
          {sessions.filter(session => session.isCurrent).map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={[styles.deviceIcon, { backgroundColor: theme.primaryGlow }]}>
                  <Ionicons 
                    name={getDeviceIcon(session.deviceType, session.os) as any} 
                    size={24} 
                    color={getDeviceColor(session.isCurrent)} 
                  />
                </View>
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionHeader}>
                    <Text style={[styles.deviceName, { color: theme.text }]}>
                      {session.device}
                    </Text>
                    <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  </View>
                  <Text style={[styles.sessionLocation, { color: theme.textMuted }]}>
                    {session.location}
                  </Text>
                  <Text style={[styles.sessionDetails, { color: theme.textMuted }]}>
                    {session.os} • {session.ipAddress}
                  </Text>
                  <View style={styles.activeIndicator}>
                    <View style={styles.activeDot} />
                    <Text style={[styles.lastActive, { color: '#4CAF50' }]}>
                      {session.lastActive}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </BlurView>

        {/* Other Sessions */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Other Sessions</Text>
            {sessions.filter(session => !session.isCurrent).length > 0 && (
              <TouchableOpacity 
                style={[styles.terminateAllButton, { backgroundColor: '#FF6B6B20' }]}
                onPress={terminateAllOtherSessions}
              >
                <Text style={[styles.terminateAllText, { color: '#FF6B6B' }]}>
                  Terminate All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {sessions.filter(session => !session.isCurrent).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Other Sessions
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                You're only signed in on this device. Great security!
              </Text>
            </View>
          ) : (
            sessions.filter(session => !session.isCurrent).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionLeft}>
                  <View style={[styles.deviceIcon, { backgroundColor: theme.border + '30' }]}>
                    <Ionicons 
                      name={getDeviceIcon(session.deviceType, session.os) as any} 
                      size={24} 
                      color={getDeviceColor(session.isCurrent)} 
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.deviceName, { color: theme.text }]}>
                      {session.device}
                    </Text>
                    <Text style={[styles.sessionLocation, { color: theme.textMuted }]}>
                      {session.location}
                    </Text>
                    <Text style={[styles.sessionDetails, { color: theme.textMuted }]}>
                      {session.os}
                      {session.browser && ` • ${session.browser}`}
                    </Text>
                    <Text style={[styles.sessionDetails, { color: theme.textMuted }]}>
                      {session.ipAddress}
                    </Text>
                    <Text style={[styles.lastActive, { color: theme.textMuted }]}>
                      Last active: {session.lastActive}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.terminateButton, { backgroundColor: '#FF6B6B20' }]}
                  onPress={() => terminateSession(session.id, session.device)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  <Text style={[styles.terminateButtonText, { color: '#FF6B6B' }]}>
                    Terminate
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </BlurView>

        {/* Security Tips */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security Tips</Text>
          
          <View style={styles.tip}>
            <Ionicons name="eye" size={20} color={theme.primary} />
            <Text style={[styles.tipText, { color: theme.textMuted }]}>
              Regularly review your active sessions for unfamiliar devices
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="key" size={20} color={theme.primary} />
            <Text style={[styles.tipText, { color: theme.textMuted }]}>
              Change your password if you see suspicious activity
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="log-out" size={20} color={theme.primary} />
            <Text style={[styles.tipText, { color: theme.textMuted }]}>
              Always sign out from public or shared devices
            </Text>
          </View>
          
          <View style={styles.tip}>
            <Ionicons name="shield" size={20} color={theme.primary} />
            <Text style={[styles.tipText, { color: theme.textMuted }]}>
              Enable two-factor authentication for extra security
            </Text>
          </View>
        </BlurView>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  refreshButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  terminateAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  terminateAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  sessionLocation: {
    fontSize: 14,
    marginBottom: 2,
  },
  sessionDetails: {
    fontSize: 13,
    marginBottom: 2,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  lastActive: {
    fontSize: 13,
    fontWeight: '500',
  },
  terminateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  terminateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});