import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

export default function ReportBug() {
  const { theme, isDark } = useTheme();
  const [bugType, setBugType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const bugTypes = [
    { id: 'crash', name: 'App Crash', icon: 'warning' },
    { id: 'ui', name: 'UI/UX Issue', icon: 'color-palette' },
    { id: 'performance', name: 'Performance', icon: 'speedometer' },
    { id: 'feature', name: 'Feature Not Working', icon: 'construct' },
    { id: 'payment', name: 'Payment Issue', icon: 'card' },
    { id: 'other', name: 'Other', icon: 'help-circle' },
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#4CAF50' },
    { id: 'medium', name: 'Medium', color: '#FF9800' },
    { id: 'high', name: 'High', color: '#FF5722' },
    { id: 'critical', name: 'Critical', color: '#F44336' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setScreenshots([...screenshots, result.assets[0].uri]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const submitBugReport = async () => {
    if (!bugType || !title || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Bug Report Submitted',
        'Thank you for helping us improve AutoBoy! We\'ll investigate this issue and get back to you soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.header}
      >
        <BlurView intensity={20} tint="light" style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report a Bug</Text>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bug Type Selection */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Bug Type *</Text>
          <View style={styles.bugTypesGrid}>
            {bugTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.bugTypeButton,
                  {
                    backgroundColor: bugType === type.id 
                      ? theme.primary + '20' 
                      : 'transparent',
                    borderColor: bugType === type.id 
                      ? theme.primary 
                      : theme.border,
                  }
                ]}
                onPress={() => {
                  setBugType(type.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={20} 
                  color={bugType === type.id ? theme.primary : theme.textMuted} 
                />
                <Text style={[
                  styles.bugTypeText,
                  { 
                    color: bugType === type.id ? theme.primary : theme.text 
                  }
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>

        {/* Basic Information */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Bug Title *</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.background + '50'
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Brief description of the bug"
              placeholderTextColor={theme.textMuted}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.background + '50'
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Detailed description of what went wrong"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: priority === p.id 
                        ? p.color + '20' 
                        : 'transparent',
                      borderColor: priority === p.id 
                        ? p.color 
                        : theme.border,
                    }
                  ]}
                  onPress={() => {
                    setPriority(p.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Text style={[
                    styles.priorityText,
                    { color: priority === p.id ? p.color : theme.text }
                  ]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BlurView>

        {/* Detailed Information */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Detailed Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Steps to Reproduce</Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.background + '50'
              }]}
              value={stepsToReproduce}
              onChangeText={setStepsToReproduce}
              placeholder="1. Go to...\n2. Click on...\n3. See error"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Expected Behavior</Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.background + '50'
              }]}
              value={expectedBehavior}
              onChangeText={setExpectedBehavior}
              placeholder="What should have happened?"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Actual Behavior</Text>
            <TextInput
              style={[styles.textArea, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.background + '50'
              }]}
              value={actualBehavior}
              onChangeText={setActualBehavior}
              placeholder="What actually happened?"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        </BlurView>

        {/* Screenshots */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Screenshots (Optional)</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Add screenshots to help us understand the issue better
          </Text>
          
          <View style={styles.screenshotsContainer}>
            {screenshots.map((screenshot, index) => (
              <View key={index} style={styles.screenshotItem}>
                <Image source={{ uri: screenshot }} style={styles.screenshot} />
                <TouchableOpacity
                  style={styles.removeScreenshot}
                  onPress={() => removeScreenshot(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
            
            {screenshots.length < 3 && (
              <TouchableOpacity
                style={[styles.addScreenshot, { borderColor: theme.border }]}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={32} color={theme.textMuted} />
                <Text style={[styles.addScreenshotText, { color: theme.textMuted }]}>
                  Add Screenshot
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>

        {/* Device Information */}
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.section, { backgroundColor: theme.backgroundAlt + '80' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Device Information</Text>
          <View style={styles.deviceInfo}>
            <View style={styles.deviceInfoItem}>
              <Text style={[styles.deviceInfoLabel, { color: theme.textMuted }]}>App Version:</Text>
              <Text style={[styles.deviceInfoValue, { color: theme.text }]}>1.0.0</Text>
            </View>
            <View style={styles.deviceInfoItem}>
              <Text style={[styles.deviceInfoLabel, { color: theme.textMuted }]}>OS:</Text>
              <Text style={[styles.deviceInfoValue, { color: theme.text }]}>iOS 17.0</Text>
            </View>
            <View style={styles.deviceInfoItem}>
              <Text style={[styles.deviceInfoLabel, { color: theme.textMuted }]}>Device:</Text>
              <Text style={[styles.deviceInfoValue, { color: theme.text }]}>iPhone 15 Pro</Text>
            </View>
          </View>
        </BlurView>

        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: theme.primary,
            opacity: loading ? 0.7 : 1 
          }]}
          onPress={submitBugReport}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Bug Report'}
          </Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  bugTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bugTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '45%',
  },
  bugTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  screenshotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  screenshotItem: {
    position: 'relative',
  },
  screenshot: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeScreenshot: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addScreenshot: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addScreenshotText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  deviceInfo: {
    gap: 12,
  },
  deviceInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfoLabel: {
    fontSize: 14,
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});