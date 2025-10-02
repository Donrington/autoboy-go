
import { StyleSheet } from 'react-native';

export const colors = {
  // Autoboy branding (Light Mode)
  primary: '#22C55E', // Primary Green
  primaryDark: '#16A34A',
  primaryLight: '#4ADE80',
  primaryGlow: '#10B981',
  primarySoft: 'rgba(34, 197, 94, 0.1)', // subtle green surface for chips/pills
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#F1F5F9',
  text: '#0F172A', // Primary Text
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textOnPrimary: '#FFFFFF',
  muted: '#94A3B8', // Secondary Text
  border: '#E2E8F0',
  borderLight: 'rgba(0, 0, 0, 0.08)',
  card: '#FFFFFF',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  glassmorphismLight: 'rgba(255, 255, 255, 0.25)',
  glassmorphismDark: 'rgba(255, 255, 255, 0.05)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowGlow: 'rgba(34, 197, 94, 0.3)',
};

// Dark mode colors (for future implementation)
export const darkColors = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#4ADE80',
  primaryGlow: '#10B981',
  primarySoft: '#064E3B',
  background: '#0A0A0A',
  backgroundAlt: '#111111',
  surface: '#1A1A1A',
  text: '#F3F4F6',
  textOnPrimary: '#FFFFFF',
  muted: '#9CA3AF',
  border: '#374151',
  card: '#111111',
  danger: '#DC2626',
  success: '#10B981',
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.text,
  },
  glassmorphism: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(20px)',
  },
});
