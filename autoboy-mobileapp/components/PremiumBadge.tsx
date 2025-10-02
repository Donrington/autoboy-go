import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumBadge({ 
  verified = false, 
  size = 'small' 
}: { 
  verified?: boolean; 
  size?: 'small' | 'large'; 
}) {
  if (!verified) return null;

  const isLarge = size === 'large';

  return (
    <LinearGradient
      colors={[colors.primaryGlow, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, isLarge && styles.badgeLarge]}
    >
      <Ionicons 
        name="checkmark-circle" 
        size={isLarge ? 16 : 12} 
        color={colors.textOnPrimary} 
      />
      <Text style={[styles.text, isLarge && styles.textLarge]}>
        {isLarge ? 'Premium Verified' : 'Verified'}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 12,
    fontWeight: '700',
  },
});