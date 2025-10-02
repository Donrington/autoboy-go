import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
  showEmpty?: boolean;
}

export default function RatingStars({ 
  rating, 
  size = 16, 
  color = colors.warning, 
  showEmpty = true 
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = showEmpty ? 5 - fullStars - (hasHalfStar ? 1 : 0) : 0;

  return (
    <View style={styles.container}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <Ionicons
          key={`full-${index}`}
          name="star"
          size={size}
          color={color}
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <Ionicons
          name="star-half"
          size={size}
          color={color}
        />
      )}
      
      {/* Empty stars */}
      {showEmpty && Array.from({ length: emptyStars }).map((_, index) => (
        <Ionicons
          key={`empty-${index}`}
          name="star-outline"
          size={size}
          color={color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});