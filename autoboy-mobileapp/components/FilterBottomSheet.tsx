import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export default function FilterBottomSheet({ isOpen, onClose, onApplyFilters }: FilterBottomSheetProps) {
  const { theme } = useTheme();
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const conditions = [
    { id: 'new', name: 'Brand New', icon: '✨' },
    { id: 'uk-used', name: 'UK Used', icon: '🇬🇧' },
    { id: 'us-used', name: 'US Used', icon: '🇺🇸' },
    { id: 'grade-a', name: 'Grade A', icon: '🏆' },
    { id: 'grade-b', name: 'Grade B', icon: '⭐' },
    { id: 'refurbished', name: 'Refurbished', icon: '🔧' },
  ];

  const priceRanges = [
    { id: 'under-50k', name: 'Under ₦50,000', min: 0, max: 50000 },
    { id: '50k-100k', name: '₦50,000 - ₦100,000', min: 50000, max: 100000 },
    { id: '100k-200k', name: '₦100,000 - ₦200,000', min: 100000, max: 200000 },
    { id: '200k-500k', name: '₦200,000 - ₦500,000', min: 200000, max: 500000 },
    { id: 'above-500k', name: 'Above ₦500,000', min: 500000, max: Infinity },
  ];

  const brands = [
    { id: 'apple', name: 'Apple', icon: '🍎' },
    { id: 'samsung', name: 'Samsung', icon: '📱' },
    { id: 'google', name: 'Google', icon: '🔍' },
    { id: 'sony', name: 'Sony', icon: '🎮' },
    { id: 'microsoft', name: 'Microsoft', icon: '💻' },
    { id: 'nintendo', name: 'Nintendo', icon: '🎮' },
  ];

  const locations = [
    { id: 'lagos', name: 'Lagos', icon: '🏙️' },
    { id: 'abuja', name: 'Abuja', icon: '🏛️' },
    { id: 'kano', name: 'Kano', icon: '🌆' },
    { id: 'ibadan', name: 'Ibadan', icon: '🏘️' },
    { id: 'port-harcourt', name: 'Port Harcourt', icon: '🛢️' },
  ];

  const toggleCondition = (conditionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const toggleBrand = (brandId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const clearAllFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedConditions([]);
    setSelectedPriceRange('');
    setSelectedBrands([]);
    setSelectedLocation('');
  };

  const applyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onApplyFilters({
      conditions: selectedConditions,
      priceRange: selectedPriceRange,
      brands: selectedBrands,
      location: selectedLocation,
    });
    onClose();
  };

  const FilterChip = ({ 
    item, 
    isSelected, 
    onPress 
  }: { 
    item: any; 
    isSelected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? theme.primary : theme.backgroundAlt,
          borderColor: isSelected ? theme.primary : theme.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.chipEmoji}>{item.icon}</Text>
      <Text style={[
        styles.chipText,
        { color: isSelected ? 'white' : theme.text }
      ]}>
        {item.name}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={16} color="white" />
      )}
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      ref={null}
      index={isOpen ? 0 : -1}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.border }}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="options" size={24} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>Filters</Text>
          </View>
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearBtn}>
            <Text style={[styles.clearText, { color: theme.textMuted }]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Condition */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Condition</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Select item conditions you're interested in
            </Text>
            <View style={styles.chipsContainer}>
              {conditions.map((condition) => (
                <FilterChip
                  key={condition.id}
                  item={condition}
                  isSelected={selectedConditions.includes(condition.id)}
                  onPress={() => toggleCondition(condition.id)}
                />
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Price Range</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Choose your budget range
            </Text>
            <View style={styles.priceRangeContainer}>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.priceRangeItem,
                    {
                      backgroundColor: selectedPriceRange === range.id ? theme.primaryGlow : theme.backgroundAlt,
                      borderColor: selectedPriceRange === range.id ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPriceRange(selectedPriceRange === range.id ? '' : range.id);
                  }}
                >
                  <View style={[
                    styles.priceRadio,
                    {
                      backgroundColor: selectedPriceRange === range.id ? theme.primary : 'transparent',
                      borderColor: selectedPriceRange === range.id ? theme.primary : theme.border,
                    }
                  ]}>
                    {selectedPriceRange === range.id && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text style={[
                    styles.priceRangeText,
                    { color: selectedPriceRange === range.id ? theme.primary : theme.text }
                  ]}>
                    {range.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Brands */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Brands</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Filter by your favorite brands
            </Text>
            <View style={styles.chipsContainer}>
              {brands.map((brand) => (
                <FilterChip
                  key={brand.id}
                  item={brand}
                  isSelected={selectedBrands.includes(brand.id)}
                  onPress={() => toggleBrand(brand.id)}
                />
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Find items near you
            </Text>
            <View style={styles.chipsContainer}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationChip,
                    {
                      backgroundColor: selectedLocation === location.id ? theme.primary : theme.backgroundAlt,
                      borderColor: selectedLocation === location.id ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedLocation(selectedLocation === location.id ? '' : location.id);
                  }}
                >
                  <Text style={styles.chipEmoji}>{location.icon}</Text>
                  <Text style={[
                    styles.chipText,
                    { color: selectedLocation === location.id ? 'white' : theme.text }
                  ]}>
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity 
            style={[styles.cancelBtn, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.applyGradient}
            >
              <Ionicons name="checkmark" size={18} color="white" />
              <Text style={styles.applyText}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  clearBtn: {
    padding: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceRangeContainer: {
    gap: 12,
  },
  priceRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  priceRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRangeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  applyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});