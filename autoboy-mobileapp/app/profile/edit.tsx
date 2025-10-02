import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function EditProfile() {
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+234 801 234 5678');
  const [bio, setBio] = useState('Tech enthusiast and gadget collector. Always looking for the latest devices.');
  const [location, setLocation] = useState('Lagos, Nigeria');

  const saveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          { backgroundColor: theme.backgroundAlt, borderColor: theme.border, color: theme.text }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={theme.name === 'dark' ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={saveProfile} style={styles.saveBtn}>
          <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change Photo</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
          />
          
          <InputField
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
          />
          
          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
          />
          
          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
          />
          
          <InputField
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
          />
          
          <InputField
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
          />
        </View>

        {/* Verification Status */}
        <View style={[styles.verificationCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
          <View style={styles.verificationHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Text style={[styles.verificationTitle, { color: theme.text }]}>Account Verification</Text>
          </View>
          <Text style={[styles.verificationText, { color: theme.textMuted }]}>
            Your account is verified. This helps build trust with other users.
          </Text>
          <View style={styles.verificationBadges}>
            <View style={[styles.badge, { backgroundColor: '#4CAF5020' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.badgeText, { color: '#4CAF50' }]}>Email Verified</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#4CAF5020' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.badgeText, { color: '#4CAF50' }]}>Phone Verified</Text>
            </View>
          </View>
        </View>
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
  saveBtn: {
    padding: 5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  verificationCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  verificationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  verificationBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});