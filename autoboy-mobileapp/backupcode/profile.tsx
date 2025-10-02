import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function SellSwapScreen() {
  const [activeMode, setActiveMode] = useState<'sell' | 'swap'>('sell');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const categories = [
    { id: 'phones', name: 'Phones', icon: '📱', gradient: ['#FF6B6B', '#FF8E8E'] },
    { id: 'laptops', name: 'Laptops', icon: '💻', gradient: ['#4ECDC4', '#44A08D'] },
    { id: 'gaming', name: 'Gaming', icon: '🎮', gradient: ['#45B7D1', '#96C93D'] },
    { id: 'audio', name: 'Audio', icon: '🎧', gradient: ['#F093FB', '#F5576C'] },
    { id: 'cameras', name: 'Cameras', icon: '📷', gradient: ['#FFA726', '#FF7043'] },
    { id: 'wearables', name: 'Wearables', icon: '⌚', gradient: ['#9C27B0', '#E91E63'] },
  ];

  const conditions = [
    { 
      id: 'new', 
      name: 'Brand New', 
      desc: 'Never used, sealed packaging',
      icon: '✨',
      color: '#22C55E'
    },
    { 
      id: 'uk-used', 
      name: 'UK Used', 
      desc: 'Imported from UK, excellent condition',
      icon: '🇬🇧',
      color: '#3B82F6'
    },
    { 
      id: 'us-used', 
      name: 'US Used', 
      desc: 'Imported from US, great condition',
      icon: '🇺🇸',
      color: '#8B5CF6'
    },
    { 
      id: 'grade-a', 
      name: 'Grade A', 
      desc: 'Excellent condition, minimal wear',
      icon: '🏆',
      color: '#F59E0B'
    },
  ];

  const samplePhotos = [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop&q=80',
  ];

  const handleModeSwitch = (mode: 'sell' | 'swap') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveMode(mode);
  };

  const addPhoto = () => {
    if (uploadedPhotos.length < 8) {
      const newPhoto = samplePhotos[uploadedPhotos.length % samplePhotos.length];
      setUploadedPhotos([...uploadedPhotos, newPhoto]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = () => {
    if (!title || !selectedCategory || !condition) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      '🎉 Success!', 
      `Your ${activeMode === 'sell' ? 'item is now listed for sale' : 'swap request has been posted'}!`,
      [{ text: 'OK', onPress: () => {
        setTitle('');
        setDescription('');
        setPrice('');
        setCondition('');
        setSelectedCategory('');
        setUploadedPhotos([]);
      }}]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Header */}
        <LinearGradient
          colors={isDark 
            ? ['rgba(34,197,94,0.2)', 'rgba(15,23,42,0.8)']
            : ['rgba(34,197,94,0.1)', 'rgba(248,250,252,0.9)']
          }
          style={styles.heroHeader}
        >
          <View style={styles.heroContent}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Turn Your Gadgets Into {activeMode === 'sell' ? 'Cash' : 'Treasure'}
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
              {activeMode === 'sell' 
                ? 'List your electronics and reach thousands of buyers'
                : 'Trade your items for something you really want'
              }
            </Text>
          </View>
          
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>25k+</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Active Buyers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>98%</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>24h</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Avg. Sale Time</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Mode Toggle */}
        <View style={styles.modeSection}>
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                { backgroundColor: activeMode === 'sell' ? theme.primary : 'transparent' }
              ]}
              onPress={() => handleModeSwitch('sell')}
            >
              <LinearGradient
                colors={activeMode === 'sell' ? [theme.primary, theme.primaryDark] : ['transparent', 'transparent']}
                style={styles.modeBtnGradient}
              >
                <Ionicons 
                  name="cash" 
                  size={20} 
                  color={activeMode === 'sell' ? 'white' : theme.textMuted} 
                />
                <Text style={[
                  styles.modeText,
                  { color: activeMode === 'sell' ? 'white' : theme.textMuted }
                ]}>
                  Sell for Cash
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modeBtn,
                { backgroundColor: activeMode === 'swap' ? theme.primary : 'transparent' }
              ]}
              onPress={() => handleModeSwitch('swap')}
            >
              <LinearGradient
                colors={activeMode === 'swap' ? [theme.primary, theme.primaryDark] : ['transparent', 'transparent']}
                style={styles.modeBtnGradient}
              >
                <Ionicons 
                  name="swap-horizontal" 
                  size={20} 
                  color={activeMode === 'swap' ? 'white' : theme.textMuted} 
                />
                <Text style={[
                  styles.modeText,
                  { color: activeMode === 'swap' ? 'white' : theme.textMuted }
                ]}>
                  Swap Items
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Photo Upload */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={24} color={theme.primary} />
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Photos</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Add up to 8 high-quality photos
              </Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
            <TouchableOpacity 
              style={[styles.addPhotoBtn, { backgroundColor: theme.backgroundAlt, borderColor: theme.primary }]}
              onPress={addPhoto}
            >
              <LinearGradient
                colors={[theme.primaryGlow, theme.primaryGlow]}
                style={styles.addPhotoBtnInner}
              >
                <Ionicons name="add" size={32} color={theme.primary} />
                <Text style={[styles.addPhotoText, { color: theme.primary }]}>Add Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {uploadedPhotos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.uploadedPhoto} />
                <TouchableOpacity 
                  style={styles.removePhotoBtn}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
                <View style={styles.photoNumber}>
                  <Text style={styles.photoNumberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={24} color={theme.primary} />
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Category</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Choose the best category for your item
              </Text>
            </View>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: selectedCategory === category.id ? theme.primaryGlow : theme.backgroundAlt,
                    borderColor: selectedCategory === category.id ? theme.primary : theme.border
                  }
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <LinearGradient
                  colors={selectedCategory === category.id ? category.gradient : ['transparent', 'transparent']}
                  style={styles.categoryIconContainer}
                >
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </LinearGradient>
                <Text style={[
                  styles.categoryName,
                  { color: selectedCategory === category.id ? theme.primary : theme.text }
                ]}>
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Item Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color={theme.primary} />
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Item Details</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Provide clear and accurate information
              </Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.backgroundAlt, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g., iPhone 15 Pro Max 256GB Space Black"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundAlt, borderColor: theme.border, color: theme.text }]}
              placeholder="Describe your item's condition, features, accessories included, reason for selling..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {activeMode === 'sell' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Price (₦) *</Text>
              <View style={[styles.priceInputContainer, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
                <Text style={[styles.currencySymbol, { color: theme.textMuted }]}>₦</Text>
                <TextInput
                  style={[styles.priceInput, { color: theme.text }]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>
          )}
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={24} color={theme.primary} />
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Condition *</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Be honest about your item's condition
              </Text>
            </View>
          </View>
          
          {conditions.map((cond) => (
            <TouchableOpacity
              key={cond.id}
              style={[
                styles.conditionCard,
                { 
                  backgroundColor: condition === cond.id ? theme.primaryGlow : theme.backgroundAlt,
                  borderColor: condition === cond.id ? theme.primary : theme.border
                }
              ]}
              onPress={() => {
                setCondition(cond.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.conditionLeft}>
                <View style={[styles.conditionIconContainer, { backgroundColor: `${cond.color}20` }]}>
                  <Text style={styles.conditionIcon}>{cond.icon}</Text>
                </View>
                <View style={styles.conditionInfo}>
                  <Text style={[styles.conditionName, { color: theme.text }]}>{cond.name}</Text>
                  <Text style={[styles.conditionDesc, { color: theme.textMuted }]}>{cond.desc}</Text>
                </View>
              </View>
              <View style={[
                styles.conditionRadio,
                { 
                  backgroundColor: condition === cond.id ? theme.primary : 'transparent',
                  borderColor: condition === cond.id ? theme.primary : theme.border
                }
              ]}>
                {condition === cond.id && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Swap Preferences */}
        {activeMode === 'swap' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={24} color={theme.primary} />
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>What are you looking for?</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                  Describe what you'd like to swap for
                </Text>
              </View>
            </View>
            
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundAlt, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g., Looking for MacBook Pro, PlayStation 5, or similar value electronics..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.submitGradient}
            >
              <Ionicons 
                name={activeMode === 'sell' ? 'cash' : 'swap-horizontal'} 
                size={24} 
                color="white" 
              />
              <Text style={styles.submitText}>
                {activeMode === 'sell' ? 'List for Sale' : 'Post Swap Request'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={[styles.submitNote, { color: theme.textMuted }]}>
            By listing your item, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroContent: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  modeSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  photosScroll: {
    gap: 16,
  },
  addPhotoBtn: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  addPhotoBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  photoContainer: {
    position: 'relative',
  },
  uploadedPhoto: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoNumber: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    gap: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  conditionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionIcon: {
    fontSize: 20,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionDesc: {
    fontSize: 14,
  },
  conditionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  submitBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  submitNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});