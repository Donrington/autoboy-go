export const lightTheme = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#4ADE80',
  primaryGlow: '#22C55E40',
  
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#4ADE80',
  primaryGlow: '#22C55E40',
  
  background: '#0F172A',
  backgroundAlt: '#1E293B',
  backgroundSecondary: '#334155',
  surface: '#1E293B',
  
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  
  border: '#334155',
  borderLight: '#475569',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  glass: 'rgba(30, 41, 59, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export type Theme = typeof lightTheme;