import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function DataStorage() {
  const { theme, isDark } = useTheme();
  const [autoBackup, setAutoBackup] = useState(true);
  const [syncAcrossDevices, setSyncAcrossDevices] = useState(true);
  const [compressImages, setCompressImages] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const storageData = {
    total: '2.4 GB',
    used: '1.8 GB',
    available: '0.6 GB',
    breakdown: [
      { category: 'Images & Media', size: '1.2 GB', percentage: 50, color: '#FF6B6B' },
      { category: 'App Data', size: '400 MB', percentage: 17, color: '#4ECDC4' },
      { category: 'Cache', size: '200 MB', percentage: 8, color: '#45B7D1' },
      { category: 'Documents', size: '0 MB', percentage: 0, color: '#96CEB4' },
    ]
  };

  const dataCategories = [
    {
      id: 'profile',
      name: 'Profile Data',
      description: 'Personal information, preferences',
      size: '2.1 MB',
      icon: 'person',
      canDelete: false,
    },
    {
      id: 'favorites',
      name: 'Favorites & Wishlist',
      description: 'Saved products and preferences',
      size: '15.3 MB',
      icon: 'heart',
      canDelete: true,
    },
    {
      id: 'search',
      name: 'Search History',
      description: 'Recent searches and filters',
      size: '8.7 MB',
      icon: 'search',
      canDelete: true,
    },
    {
      id: 'messages',
      name: 'Messages & Chats',
      description: 'Support conversations',
      size: '45.2 MB',
      icon: 'chatbubbles',
      canDelete: true,
    },
    {
      id: 'images',
      name: 'Downloaded Images',
      description: 'Product images and media',
      size: '1.2 GB',
      icon: 'images',
      canDelete: true,
    },
    {
      id: 'cache',
      name: 'App Cache',
      description: 'Temporary files and data',
      size: '200 MB',
      icon: 'server',
      canDelete: true,
    },
  ];

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!currentValue);
  };

  const clearData = (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Clear Data',
      `Are you sure you want to clear ${categoryName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Success', `${categoryName} has been cleared.`);
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be prepared for download. You\'ll receive an email when it\'s ready.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Export Started', 'We\'ll email you when your data is ready for download.');
          }
        }
      ]
    );
  };

  const StorageBar = () => (
    <View style={styles.storageBar}>
      {storageData.breakdown.map((item, index) => (
        <View
          key={index}
          style={[
            styles.storageSegment,
            {
              flex: item.percentage,
              backgroundColor: item.color,
              borderTopLeftRadius: index === 0 ? 8 : 0,
              borderBottomLeftRadius: index === 0 ? 8 : 0,
              borderTopRightRadius: index === storageData.breakdown.length - 1 ? 8 : 0,
              borderBottomRightRadius: index === storageData.breakdown.length - 1 ? 8 : 0,
            }
          ]}
        />
      ))}
    </View>
  );

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
          <Text style={styles.headerTitle}>Data & Storage</Text>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Storage Overview */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Storage Usage</Text>
          
          <View style={styles.storageOverview}>
            <View style={styles.storageStats}>
              <View style={styles.storageStat}>
                <Text style={[styles.storageValue, { color: theme.primary }]}>
                  {storageData.used}
                </Text>
                <Text style={[styles.storageLabel, { color: theme.textMuted }]}>Used</Text>
              </View>
              <View style={styles.storageStat}>
                <Text style={[styles.storageValue, { color: theme.text }]}>
                  {storageData.total}
                </Text>
                <Text style={[styles.storageLabel, { color: theme.textMuted }]}>Total</Text>
              </View>
              <View style={styles.storageStat}>
                <Text style={[styles.storageValue, { color: '#4CAF50' }]}>
                  {storageData.available}
                </Text>
                <Text style={[styles.storageLabel, { color: theme.textMuted }]}>Available</Text>
              </View>
            </View>
            
            <StorageBar />
            
            <View style={styles.storageBreakdown}>
              {storageData.breakdown.map((item, index) => (
                <View key={index} style={styles.breakdownItem}>
                  <View style={[styles.breakdownColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.breakdownCategory, { color: theme.text }]}>
                    {item.category}
                  </Text>
                  <Text style={[styles.breakdownSize, { color: theme.textMuted }]}>
                    {item.size}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </BlurView>

        {/* Data Management */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Categories</Text>
          
          {dataCategories.map((category) => (
            <View key={category.id} style={styles.dataItem}>
              <View style={styles.dataItemLeft}>
                <View style={[styles.dataIcon, { backgroundColor: theme.primaryGlow }]}>
                  <Ionicons name={category.icon as any} size={20} color={theme.primary} />
                </View>
                <View style={styles.dataInfo}>
                  <Text style={[styles.dataName, { color: theme.text }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.dataDescription, { color: theme.textMuted }]}>
                    {category.description}
                  </Text>
                </View>
              </View>
              <View style={styles.dataItemRight}>
                <Text style={[styles.dataSize, { color: theme.textMuted }]}>
                  {category.size}
                </Text>
                {category.canDelete && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => clearData(category.id, category.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </BlurView>

        {/* Settings */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Storage Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-upload" size={20} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingName, { color: theme.text }]}>
                  Auto Backup
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textMuted }]}>
                  Automatically backup your data
                </Text>
              </View>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={() => handleToggle(setAutoBackup, autoBackup)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={autoBackup ? theme.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync" size={20} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingName, { color: theme.text }]}>
                  Sync Across Devices
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textMuted }]}>
                  Keep data synced on all devices
                </Text>
              </View>
            </View>
            <Switch
              value={syncAcrossDevices}
              onValueChange={() => handleToggle(setSyncAcrossDevices, syncAcrossDevices)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={syncAcrossDevices ? theme.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="image" size={20} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingName, { color: theme.text }]}>
                  Compress Images
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textMuted }]}>
                  Reduce image quality to save space
                </Text>
              </View>
            </View>
            <Switch
              value={compressImages}
              onValueChange={() => handleToggle(setCompressImages, compressImages)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={compressImages ? theme.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-offline" size={20} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingName, { color: theme.text }]}>
                  Offline Mode
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textMuted }]}>
                  Cache data for offline access
                </Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={() => handleToggle(setOfflineMode, offlineMode)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={offlineMode ? theme.primary : '#f4f3f4'}
            />
          </View>
        </BlurView>

        {/* Actions */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
            onPress={exportData}
          >
            <Ionicons name="download" size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>
              Export My Data
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF6B6B20' }]}
            onPress={() => clearData('all', 'All App Data')}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
              Clear All Data
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
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
  storageOverview: {
    gap: 16,
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  storageStat: {
    alignItems: 'center',
  },
  storageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storageLabel: {
    fontSize: 12,
  },
  storageBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  storageSegment: {
    height: '100%',
  },
  storageBreakdown: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownCategory: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownSize: {
    fontSize: 14,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dataItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataInfo: {
    flex: 1,
  },
  dataName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dataDescription: {
    fontSize: 13,
  },
  dataItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataSize: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
});