import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function ThemeToggle({ size = 24 }: { size?: number }) {
  const { isDark, setThemeMode } = useTheme();

  const toggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={isDark ? 'sunny' : 'moon'} 
        size={size} 
        color={isDark ? '#F59E0B' : '#6366F1'} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 12,
  },
});