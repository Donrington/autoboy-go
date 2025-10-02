import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function AddressesScreen() {
  const { theme } = useTheme();
  const [addresses] = useState([
    {
      id: '1',
      name: 'Home',
      fullName: 'John Doe',
      phone: '+234 801 234 5678',
      address: '123 Victoria Island, Lagos State, Nigeria',
      isDefault: true
    },
    {
      id: '2',
      name: 'Office',
      fullName: 'John Doe',
      phone: '+234 801 234 5678',
      address: '456 Ikoyi Business District, Lagos State, Nigeria',
      isDefault: false
    }
  ]);

  const addAddress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Add Address', 'Address management coming soon!');
  };

  const AddressCard = ({ address }: { address: any }) => (
    <View style={[styles.addressCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitle}>
          <Text style={[styles.addressName, { color: theme.text }]}>{address.name}</Text>
          {address.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: theme.primaryGlow }]}>
              <Text style={[styles.defaultText, { color: theme.primary }]}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.fullName, { color: theme.text }]}>{address.fullName}</Text>
      <Text style={[styles.phone, { color: theme.textMuted }]}>{address.phone}</Text>
      <Text style={[styles.addressText, { color: theme.textMuted }]}>{address.address}</Text>
      
      <View style={styles.addressActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: theme.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Delivery Addresses</Text>
        <TouchableOpacity onPress={addAddress} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} />
        ))}

        <TouchableOpacity 
          style={[styles.addAddressBtn, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
          onPress={addAddress}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
          <Text style={[styles.addAddressText, { color: theme.primary }]}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addressCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreBtn: {
    padding: 5,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionBtn: {
    padding: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: '600',
  },
});