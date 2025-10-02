import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function PayoutSettings() {
  const { theme, isDark } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [minimumAmount, setMinimumAmount] = useState('50000');
  const [withdrawalDay, setWithdrawalDay] = useState('friday');

  const payoutMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct transfer to your bank account',
      icon: 'card',
      fee: '₦50',
      processingTime: '1-2 business days',
      isActive: true,
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      description: 'Transfer to mobile wallet',
      icon: 'phone-portrait',
      fee: '₦25',
      processingTime: 'Instant',
      isActive: false,
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Receive payments in crypto',
      icon: 'logo-bitcoin',
      fee: '2%',
      processingTime: '10-30 minutes',
      isActive: false,
    },
  ];

  const bankAccounts = [
    {
      id: '1',
      bankName: 'First Bank Nigeria',
      accountNumber: '****1234',
      accountName: 'John Doe',
      isDefault: true,
    },
    {
      id: '2',
      bankName: 'GTBank',
      accountNumber: '****5678',
      accountName: 'John Doe',
      isDefault: false,
    },
  ];

  const withdrawalDays = [
    { id: 'monday', name: 'Monday' },
    { id: 'tuesday', name: 'Tuesday' },
    { id: 'wednesday', name: 'Wednesday' },
    { id: 'thursday', name: 'Thursday' },
    { id: 'friday', name: 'Friday' },
  ];

  const payoutHistory = [
    {
      id: '1',
      amount: '₦125,000',
      method: 'Bank Transfer',
      status: 'completed',
      date: '2025-01-15',
      reference: 'PO-2025-001',
    },
    {
      id: '2',
      amount: '₦89,500',
      method: 'Bank Transfer',
      status: 'pending',
      date: '2025-01-10',
      reference: 'PO-2025-002',
    },
    {
      id: '3',
      amount: '₦67,200',
      method: 'Mobile Money',
      status: 'completed',
      date: '2025-01-05',
      reference: 'PO-2025-003',
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'Choose a payment method to add', [
      { text: 'Bank Account', onPress: () => router.push('/add-bank-account') },
      { text: 'Mobile Wallet', onPress: () => router.push('/add-mobile-wallet') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const requestPayout = () => {
    Alert.alert(
      'Request Payout',
      'Are you sure you want to request a payout of your available balance?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Success', 'Payout request submitted successfully!');
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#FF5722';
      default: return theme.textMuted;
    }
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
          <Text style={styles.headerTitle}>Payout Settings</Text>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Overview */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Balance</Text>
          
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceAmount, { color: theme.primary }]}>₦234,500</Text>
            <Text style={[styles.balanceLabel, { color: theme.textMuted }]}>
              Ready for withdrawal
            </Text>
          </View>

          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={[styles.statValue, { color: theme.text }]}>₦45,200</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pending</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={[styles.statValue, { color: theme.text }]}>₦1,234,500</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Earned</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.payoutButton, { backgroundColor: theme.primary }]}
            onPress={requestPayout}
          >
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Payout Methods */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payout Methods</Text>
            <TouchableOpacity onPress={addPaymentMethod}>
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {payoutMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                {
                  borderColor: selectedMethod === method.id ? theme.primary : theme.border,
                  backgroundColor: selectedMethod === method.id 
                    ? theme.primary + '10' 
                    : 'transparent',
                }
              ]}
              onPress={() => handleMethodSelect(method.id)}
            >
              <View style={styles.methodLeft}>
                <View style={[
                  styles.methodIcon,
                  { backgroundColor: method.isActive ? theme.primaryGlow : theme.border + '50' }
                ]}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={20} 
                    color={method.isActive ? theme.primary : theme.textMuted} 
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, { color: theme.text }]}>
                    {method.name}
                  </Text>
                  <Text style={[styles.methodDescription, { color: theme.textMuted }]}>
                    {method.description}
                  </Text>
                  <View style={styles.methodDetails}>
                    <Text style={[styles.methodFee, { color: theme.textMuted }]}>
                      Fee: {method.fee}
                    </Text>
                    <Text style={[styles.methodTime, { color: theme.textMuted }]}>
                      • {method.processingTime}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.methodRight}>
                {selectedMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                )}
                {!method.isActive && (
                  <View style={[styles.inactiveBadge, { backgroundColor: '#FF9800' }]}>
                    <Text style={styles.inactiveBadgeText}>Setup Required</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </BlurView>

        {/* Bank Accounts */}
        {selectedMethod === 'bank' && (
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Bank Accounts</Text>
            
            {bankAccounts.map((account) => (
              <View key={account.id} style={styles.bankAccount}>
                <View style={styles.bankAccountLeft}>
                  <View style={[styles.bankIcon, { backgroundColor: theme.primaryGlow }]}>
                    <Ionicons name="business" size={20} color={theme.primary} />
                  </View>
                  <View style={styles.bankInfo}>
                    <Text style={[styles.bankName, { color: theme.text }]}>
                      {account.bankName}
                    </Text>
                    <Text style={[styles.accountNumber, { color: theme.textMuted }]}>
                      {account.accountNumber}
                    </Text>
                    <Text style={[styles.accountName, { color: theme.textMuted }]}>
                      {account.accountName}
                    </Text>
                  </View>
                </View>
                {account.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            ))}
          </BlurView>
        )}

        {/* Auto Withdrawal Settings */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Auto Withdrawal</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingName, { color: theme.text }]}>
                Enable Auto Withdrawal
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textMuted }]}>
                Automatically withdraw when minimum amount is reached
              </Text>
            </View>
            <Switch
              value={autoWithdraw}
              onValueChange={setAutoWithdraw}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={autoWithdraw ? theme.primary : '#f4f3f4'}
            />
          </View>

          {autoWithdraw && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Minimum Amount (₦)</Text>
                <TextInput
                  style={[styles.input, { 
                    borderColor: theme.border, 
                    color: theme.text,
                    backgroundColor: theme.background + '50'
                  }]}
                  value={minimumAmount}
                  onChangeText={setMinimumAmount}
                  placeholder="50000"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Withdrawal Day</Text>
                <View style={styles.daySelector}>
                  {withdrawalDays.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: withdrawalDay === day.id 
                            ? theme.primary 
                            : 'transparent',
                          borderColor: withdrawalDay === day.id 
                            ? theme.primary 
                            : theme.border,
                        }
                      ]}
                      onPress={() => setWithdrawalDay(day.id)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        { 
                          color: withdrawalDay === day.id 
                            ? 'white' 
                            : theme.text 
                        }
                      ]}>
                        {day.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </BlurView>

        {/* Payout History */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Payouts</Text>
          
          {payoutHistory.map((payout) => (
            <View key={payout.id} style={styles.payoutItem}>
              <View style={styles.payoutLeft}>
                <Text style={[styles.payoutAmount, { color: theme.text }]}>
                  {payout.amount}
                </Text>
                <Text style={[styles.payoutMethod, { color: theme.textMuted }]}>
                  {payout.method}
                </Text>
                <Text style={[styles.payoutDate, { color: theme.textMuted }]}>
                  {payout.date}
                </Text>
              </View>
              <View style={styles.payoutRight}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(payout.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(payout.status) }
                  ]}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </Text>
                </View>
                <Text style={[styles.payoutReference, { color: theme.textMuted }]}>
                  {payout.reference}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/payout-history')}
          >
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              View All Payouts
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  balanceStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  methodDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  methodFee: {
    fontSize: 12,
  },
  methodTime: {
    fontSize: 12,
  },
  methodRight: {
    alignItems: 'flex-end',
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  bankAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  bankAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  accountName: {
    fontSize: 12,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  settingLeft: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  payoutLeft: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  payoutMethod: {
    fontSize: 13,
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: 12,
  },
  payoutRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payoutReference: {
    fontSize: 11,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});