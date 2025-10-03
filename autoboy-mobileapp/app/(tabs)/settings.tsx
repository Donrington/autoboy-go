import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function Settings() {
  const { theme, isDark, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isPremium: true,
    verified: true
  };

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!currentValue);
  };

  const showAlert = (title: string, message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(title, message);
  };

  const navigateTo = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (route) {
      case '/profile/edit':
        router.push('/profile/edit');
        break;
      case '/payment-methods':
        router.push('/payment-methods');
        break;
      case '/addresses':
        router.push('/addresses');
        break;
      case '/verification':
        router.push('/verification');
        break;
      case '/premium':
        router.push('/premium');
        break;
      case '/seller-dashboard':
        router.push('/seller-dashboard');
        break;
      case '/analytics':
        router.push('/analytics');
        break;
      case '/transaction-history':
        router.push('/transaction-history');
        break;
      case '/notifications':
        router.push('/notifications');
        break;
      case '/change-password':
        router.push('/change-password');
        break;
      case '/active-sessions':
        router.push('/active-sessions');
        break;
      case '/data-storage':
        router.push('/data-storage');
        break;
      case '/payout-settings':
        router.push('/payout-settings');
        break;
      case '/favorites':
        router.push('/favorites');
        break;
      case '/support-chat':
        router.push('/support-chat');
        break;
      case '/report-bug':
        router.push('/report-bug');
        break;
      case '/wallet':
        router.push('/wallet');
        break;
      case '/price-alerts':
        router.push('/price-alerts');
        break;
      case '/swap':
        router.push('/swap');
        break;
      case '/disputes':
        router.push('/disputes');
        break;
      case '/badges':
        router.push('/badges');
        break;
      default:
        showAlert('Navigation', `Navigate to ${route}`);
    }
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.sectionContent, { backgroundColor: theme.backgroundAlt + '80' }]}>
        {children}
      </BlurView>
    </View>
  );

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    showArrow = true,
    iconColor,
    danger = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
    iconColor?: string;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { 
          backgroundColor: danger ? '#FF6B6B20' : theme.primaryGlow 
        }]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={danger ? '#FF6B6B' : (iconColor || theme.primary)} 
          />
        </View>
        <View style={styles.itemText}>
          <Text style={[styles.itemTitle, { 
            color: danger ? '#FF6B6B' : theme.text 
          }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.itemSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.itemRight}>
        {rightElement}
        {showArrow && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <BlurView intensity={20} tint="light" style={styles.headerContent}>
          <View style={styles.profileSection}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name}</Text>
                {user.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                )}
                {user.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="diamond" size={12} color="#FFD700" />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="person-outline"
            title="Profile Information"
            subtitle="Update your personal details"
            onPress={() => navigateTo('/profile/edit')}
          />
          <SettingsItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage cards and payment options"
            onPress={() => navigateTo('/payment-methods')}
          />
          <SettingsItem
            icon="location-outline"
            title="Delivery Addresses"
            subtitle="Manage your delivery locations"
            onPress={() => navigateTo('/addresses')}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Verification Status"
            subtitle={user.verified ? "Verified account" : "Complete KYC verification"}
            onPress={() => navigateTo('/verification')}
            iconColor={user.verified ? "#4CAF50" : undefined}
          />
          <SettingsItem
            icon="diamond-outline"
            title="Premium Membership"
            subtitle={user.isPremium ? "Premium active" : "Upgrade to premium"}
            onPress={() => navigateTo('/premium')}
            iconColor={user.isPremium ? "#FFD700" : undefined}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Toggle between light and dark theme"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={() => setThemeMode(isDark ? 'light' : 'dark')}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDark ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="language-outline"
            title="Language & Region"
            subtitle="English (Nigeria)"
            onPress={() => navigateTo('/language')}
          />
          <SettingsItem
            icon="pricetag-outline"
            title="Currency"
            subtitle="Nigerian Naira (₦)"
            onPress={() => navigateTo('/currency')}
          />
          <SettingsItem
            icon="location-outline"
            title="Location Services"
            subtitle="Enable location-based features"
            rightElement={
              <Switch
                value={locationServices}
                onValueChange={(value) => handleToggle(setLocationServices, locationServices)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={locationServices ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="cloud-outline"
            title="Auto Backup"
            subtitle="Backup data automatically"
            rightElement={
              <Switch
                value={autoBackup}
                onValueChange={(value) => handleToggle(setAutoBackup, autoBackup)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={autoBackup ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive app notifications"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={(value) => handleToggle(setPushNotifications, pushNotifications)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={pushNotifications ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive updates via email"
            rightElement={
              <Switch
                value={marketingEmails}
                onValueChange={(value) => handleToggle(setMarketingEmails, marketingEmails)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={marketingEmails ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="chatbubble-outline"
            title="SMS Notifications"
            subtitle="Receive SMS updates"
            rightElement={
              <Switch
                value={smsNotifications}
                onValueChange={(value) => handleToggle(setSmsNotifications, smsNotifications)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={smsNotifications ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="settings-outline"
            title="Notification Preferences"
            subtitle="Customize notification types"
            onPress={() => navigateTo('/notifications')}
          />
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection title="Security & Privacy">
          <SettingsItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            rightElement={
              <Switch
                value={biometric}
                onValueChange={(value) => handleToggle(setBiometric, biometric)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={biometric ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="shield-outline"
            title="Two-Factor Authentication"
            subtitle="Add extra security to your account"
            rightElement={
              <Switch
                value={twoFactor}
                onValueChange={(value) => handleToggle(setTwoFactor, twoFactor)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={twoFactor ? theme.primary : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
          <SettingsItem
            icon="key-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => navigateTo('/change-password')}
          />
          <SettingsItem
            icon="eye-outline"
            title="Privacy Settings"
            subtitle="Control your data and privacy"
            onPress={() => navigateTo('/privacy')}
          />
          <SettingsItem
            icon="log-out-outline"
            title="Active Sessions"
            subtitle="Manage logged in devices"
            onPress={() => navigateTo('/active-sessions')}
          />
          <SettingsItem
            icon="lock-closed-outline"
            title="Data & Storage"
            subtitle="Manage app data and storage"
            onPress={() => navigateTo('/data-storage')}
          />
        </SettingsSection>

        {/* Business Section */}
        <SettingsSection title="Business & Selling">
          <SettingsItem
            icon="storefront-outline"
            title="Seller Dashboard"
            subtitle="Manage your listings and sales"
            onPress={() => navigateTo('/seller-dashboard')}
          />
          <SettingsItem
            icon="analytics-outline"
            title="Sales Analytics"
            subtitle="View your performance metrics"
            onPress={() => navigateTo('/analytics')}
          />
          <SettingsItem
            icon="card-outline"
            title="Payout Settings"
            subtitle="Manage how you receive payments"
            onPress={() => navigateTo('/payout-settings')}
          />
          <SettingsItem
            icon="receipt-outline"
            title="Tax Information"
            subtitle="Manage tax documents"
            onPress={() => navigateTo('/tax-info')}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support & Legal">
          <SettingsItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => navigateTo('/help')}
          />
          <SettingsItem
            icon="chatbubble-ellipses-outline"
            title="Contact Support"
            subtitle="Chat with our support team"
            onPress={() => navigateTo('/support-chat')}
          />
          <SettingsItem
            icon="bug-outline"
            title="Report a Bug"
            subtitle="Help us improve the app"
            onPress={() => navigateTo('/report-bug')}
          />
          <SettingsItem
            icon="star-outline"
            title="Rate AutoBoy"
            subtitle="Rate us on the App Store"
            onPress={() => navigateTo('/rate-app')}
          />
          <SettingsItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => navigateTo('/terms')}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() => navigateTo('/privacy-policy')}
          />
          <SettingsItem
            icon="information-circle-outline"
            title="About AutoBoy"
            subtitle="Learn more about our app"
            onPress={() => navigateTo('/about')}
          />
        </SettingsSection>

        {/* Shopping Section */}
        <SettingsSection title="Shopping">
          <SettingsItem
            icon="heart-outline"
            title="Favorite Products"
            subtitle="View your saved items"
            onPress={() => navigateTo('/favorites')}
          />
          <SettingsItem
            icon="wallet-outline"
            title="My Wallet"
            subtitle="Manage your balance and transactions"
            onPress={() => navigateTo('/wallet')}
          />
          <SettingsItem
            icon="notifications-outline"
            title="Price Alerts"
            subtitle="Manage your price notifications"
            onPress={() => navigateTo('/price-alerts')}
          />
          <SettingsItem
            icon="swap-horizontal-outline"
            title="Swap Deals"
            subtitle="View your swap transactions"
            onPress={() => navigateTo('/swap')}
          />
          <SettingsItem
            icon="shield-outline"
            title="My Disputes"
            subtitle="View and manage disputes"
            onPress={() => navigateTo('/disputes')}
          />
          <SettingsItem
            icon="trophy-outline"
            title="Badges & Rewards"
            subtitle="View your achievements and points"
            onPress={() => navigateTo('/badges')}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Account Management">
          <SettingsItem
            icon="log-out-outline"
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: () => navigateTo('/auth/login') }
                ]
              );
            }}
            danger
          />
          <SettingsItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'This action cannot be undone. All your data will be permanently deleted.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => navigateTo('/delete-account') }
                ]
              );
            }}
            danger
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>AutoBoy v1.0.0</Text>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>© 2025 AutoBoy Technologies</Text>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>Made with ❤️ in Nigeria</Text>
        </View>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFD700',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 5,
  },
  sectionContent: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 5,
  },
  footerText: {
    fontSize: 14,
  },
});