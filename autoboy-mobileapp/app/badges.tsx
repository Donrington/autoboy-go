import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Badge, RewardPoints } from '../types';

const mockBadges: Badge[] = [
  { id: '1', name: 'First Sale', description: 'Complete your first sale', icon: 'trophy', type: 'achievement', category: 'trading', level: 1, earnedAt: '2024-01-10T10:00:00Z' },
  { id: '2', name: 'Verified Seller', description: 'Complete identity verification', icon: 'shield-checkmark', type: 'verification', category: 'quality', level: 1, earnedAt: '2024-01-05T15:30:00Z' },
  { id: '3', name: 'Top Rated', description: 'Maintain 4.8+ rating with 50+ reviews', icon: 'star', type: 'milestone', category: 'quality', level: 3 },
  { id: '4', name: 'Swap Master', description: 'Complete 10 successful swaps', icon: 'swap-horizontal', type: 'achievement', category: 'trading', level: 2 },
];

const mockRewards: RewardPoints = {
  userId: 'user1',
  currentPoints: 2450,
  totalEarned: 5670,
  currentTier: 'gold',
  nextTierPoints: 3000,
  lifetimePoints: 5670,
};

export default function BadgesScreen() {
  const { theme } = useTheme();
  const [badges] = useState<Badge[]>(mockBadges);
  const [rewards] = useState<RewardPoints>(mockRewards);

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[tier as keyof typeof colors] || '#CD7F32';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      trading: '#4ECDC4',
      community: '#45B7D1',
      quality: '#96CEB4',
      loyalty: '#FFEAA7'
    };
    return colors[category as keyof typeof colors] || theme.primary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Badges & Rewards</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Rewards Summary */}
        <View style={[styles.rewardsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.rewardsHeader}>
            <View>
              <Text style={[styles.pointsText, { color: theme.text }]}>{rewards.currentPoints.toLocaleString()}</Text>
              <Text style={[styles.pointsLabel, { color: theme.textMuted }]}>Current Points</Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(rewards.currentTier) }]}>
              <Text style={styles.tierText}>{rewards.currentTier.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: theme.textMuted }]}>
                {rewards.nextTierPoints - rewards.currentPoints} points to next tier
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: getTierColor(rewards.currentTier),
                    width: `${(rewards.currentPoints / rewards.nextTierPoints) * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Badges Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeCard, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: badge.earnedAt ? getCategoryColor(badge.category) : theme.border,
                  opacity: badge.earnedAt ? 1 : 0.6
                }
              ]}
            >
              <View style={[styles.badgeIcon, { backgroundColor: getCategoryColor(badge.category) }]}>
                <Ionicons 
                  name={badge.icon as any} 
                  size={24} 
                  color="white" 
                />
              </View>
              <Text style={[styles.badgeName, { color: theme.text }]} numberOfLines={1}>
                {badge.name}
              </Text>
              <Text style={[styles.badgeDescription, { color: theme.textMuted }]} numberOfLines={2}>
                {badge.description}
              </Text>
              {badge.earnedAt && (
                <View style={styles.earnedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={getCategoryColor(badge.category)} />
                  <Text style={[styles.earnedText, { color: getCategoryColor(badge.category) }]}>Earned</Text>
                </View>
              )}
              {badge.level > 1 && (
                <View style={[styles.levelBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.levelText}>Lv.{badge.level}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Points History */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          <View style={[styles.historyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.historyItem}>
              <Ionicons name="add-circle" size={20} color="#4ECDC4" />
              <View style={styles.historyText}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>Sale Completed</Text>
                <Text style={[styles.historyDate, { color: theme.textMuted }]}>2 hours ago</Text>
              </View>
              <Text style={[styles.historyPoints, { color: '#4ECDC4' }]}>+150 pts</Text>
            </View>
            <View style={styles.historyItem}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <View style={styles.historyText}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>5-Star Review</Text>
                <Text style={[styles.historyDate, { color: theme.textMuted }]}>1 day ago</Text>
              </View>
              <Text style={[styles.historyPoints, { color: '#4ECDC4' }]}>+50 pts</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  rewardsCard: { padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  rewardsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pointsText: { fontSize: 32, fontWeight: 'bold' },
  pointsLabel: { fontSize: 14, marginTop: 4 },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tierText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  progressContainer: { marginTop: 8 },
  progressInfo: { marginBottom: 8 },
  progressText: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 },
  badgeCard: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 2, position: 'relative' },
  badgeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  badgeName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  badgeDescription: { fontSize: 12, lineHeight: 16 },
  earnedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  earnedText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  levelBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  levelText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  historySection: { marginTop: 16 },
  historyCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyText: { flex: 1, marginLeft: 12 },
  historyTitle: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 12, marginTop: 2 },
  historyPoints: { fontSize: 14, fontWeight: 'bold' },
});