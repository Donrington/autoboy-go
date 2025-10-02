import { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface WishlistButtonProps {
  productId: string;
  isWishlisted?: boolean;
  size?: number;
  onToggle?: (productId: string, isWishlisted: boolean) => void;
}

export default function WishlistButton({ 
  productId, 
  isWishlisted = false, 
  size = 24,
  onToggle 
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);

  const handleToggle = () => {
    const newState = !wishlisted;
    setWishlisted(newState);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call parent callback
    onToggle?.(productId, newState);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        wishlisted && styles.buttonActive
      ]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={wishlisted ? "heart" : "heart-outline"}
        size={size}
        color={wishlisted ? colors.danger : colors.muted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.danger,
  },
});