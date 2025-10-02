import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed' | 'shipping';
  description: string;
}

interface PromoCodeInputProps {
  onApply: (promo: PromoCode) => void;
  onRemove: () => void;
  appliedPromo?: PromoCode | null;
}

const validPromoCodes: Record<string, PromoCode> = {
  'SAVE10': { 
    code: 'SAVE10', 
    discount: 0.1, 
    type: 'percentage', 
    description: '10% off' 
  },
  'WELCOME': { 
    code: 'WELCOME', 
    discount: 100000, 
    type: 'fixed', 
    description: '₦100,000 off' 
  },
  'FREESHIP': { 
    code: 'FREESHIP', 
    discount: 0, 
    type: 'shipping', 
    description: 'Free shipping' 
  }
};

export default function PromoCodeInput({ onApply, onRemove, appliedPromo }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');

  const handleApply = () => {
    const upperCode = promoCode.toUpperCase();
    const validPromo = validPromoCodes[upperCode];
    
    if (validPromo) {
      onApply(validPromo);
      setPromoCode('');
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid promo code.');
    }
  };

  const handleRemove = () => {
    onRemove();
  };

  if (appliedPromo) {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedInfo}>
          <Ionicons name="pricetag" size={16} color={colors.success} />
          <Text style={styles.appliedCode}>Code: {appliedPromo.code}</Text>
          <Text style={styles.appliedDescription}>({appliedPromo.description})</Text>
        </View>
        <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
          <Ionicons name="close" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Promo Code</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter promo code"
          placeholderTextColor={colors.muted}
          value={promoCode}
          onChangeText={setPromoCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.applyButton, !promoCode && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={!promoCode}
        >
          <Text style={[styles.applyText, !promoCode && styles.applyTextDisabled]}>
            Apply
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Available codes hint */}
      <Text style={styles.hint}>
        Try: SAVE10, WELCOME, or FREESHIP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.muted,
  },
  applyText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  applyTextDisabled: {
    color: colors.background,
  },
  appliedContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  appliedCode: {
    color: colors.text,
    fontWeight: '700',
  },
  appliedDescription: {
    color: colors.success,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    fontStyle: 'italic',
  },
});