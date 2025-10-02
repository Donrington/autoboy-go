import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function BiometricAuth({ onSuccess, onCancel }: { 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Mock biometric authentication
    setTimeout(() => {
      setIsAuthenticating(false);
      Alert.alert(
        'Biometric Authentication',
        'Authentication successful!',
        [{ text: 'OK', onPress: onSuccess }]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name="finger-print" 
          size={80} 
          color={colors.primary} 
          style={styles.icon}
        />
        <Text style={styles.title}>Biometric Authentication</Text>
        <Text style={styles.subtitle}>
          Use your fingerprint or face ID to secure your account
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, isAuthenticating && styles.buttonDisabled]}
          onPress={handleBiometricAuth}
          disabled={isAuthenticating}
        >
          <Text style={styles.buttonText}>
            {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Use Password Instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    margin: 20,
    minWidth: 300,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});