import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import verificationService, { VerificationDocument } from '../services/verificationService';

export default function VerificationScreen() {
  const { theme, isDark } = useTheme();
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>({});

  const verificationSteps = [
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your email address',
      status: 'completed',
      icon: 'mail'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your phone number',
      status: 'completed',
      icon: 'call'
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify your identity with BVN/NIN',
      status: 'pending',
      icon: 'person'
    },
    {
      id: 'address',
      title: 'Address Verification',
      description: 'Verify your residential address',
      status: 'pending',
      icon: 'location'
    }
  ];

  const submitVerification = async () => {
    if (!bvn && !nin) {
      Alert.alert('Error', 'Please provide either BVN or NIN');
      return;
    }

    if (!selfieImage) {
      Alert.alert('Error', 'Please take a selfie for facial verification');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Step 1: Verify BVN or NIN
      let identityResult;
      if (bvn) {
        identityResult = await verificationService.verifyBVN(bvn);
      } else if (nin) {
        identityResult = await verificationService.verifyNIN(nin);
      }
      
      if (identityResult) {
        setVerificationResults(prev => ({ ...prev, identity: identityResult }));
      }

      // Step 2: Verify face
      const faceResult = await verificationService.verifyFace(selfieImage);
      setVerificationResults(prev => ({ ...prev, face: faceResult }));

      setIsLoading(false);
      Alert.alert(
        'Verification Submitted',
        'Your verification has been submitted successfully. You will be notified once it\'s reviewed.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Verification failed. Please try again.');
    }
  };

  const takeSelfie = async () => {
    try {
      const selfieUri = await verificationService.captureSelfie();
      setSelfieImage(selfieUri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to capture selfie');
    }
  };

  const VerificationStep = ({ step }: { step: any }) => (
    <View style={[styles.stepCard, { backgroundColor: theme.backgroundAlt, borderColor: theme.border }]}>
      <View style={styles.stepHeader}>
        <View style={[
          styles.stepIcon,
          {
            backgroundColor: step.status === 'completed' ? theme.success + '20' : 
                           step.status === 'pending' ? theme.warning + '20' : theme.primaryGlow
          }
        ]}>
          <Ionicons 
            name={step.status === 'completed' ? 'checkmark' : step.icon} 
            size={20} 
            color={step.status === 'completed' ? theme.success : 
                   step.status === 'pending' ? theme.warning : theme.primary} 
          />
        </View>
        <View style={styles.stepInfo}>
          <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
          <Text style={[styles.stepDescription, { color: theme.textMuted }]}>{step.description}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          {
            backgroundColor: step.status === 'completed' ? theme.success + '20' : 
                           step.status === 'pending' ? theme.warning + '20' : theme.primaryGlow
          }
        ]}>
          <Text style={[
            styles.statusText,
            {
              color: step.status === 'completed' ? theme.success : 
                     step.status === 'pending' ? theme.warning : theme.primary
            }
          ]}>
            {step.status === 'completed' ? 'Verified' : 
             step.status === 'pending' ? 'Pending' : 'Required'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Account Verification</Text>
        <View style={{ width: 24 }} />
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.progressTitle, { color: theme.text }]}>Verification Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '50%' }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textMuted }]}>2 of 4 steps completed</Text>
        </View>

        {/* Verification Steps */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Verification Steps</Text>
        {verificationSteps.map((step) => (
          <VerificationStep key={step.id} step={step} />
        ))}

        {/* Identity Verification Form */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.formTitle, { color: theme.text }]}>Complete Identity Verification</Text>
          <Text style={[styles.formSubtitle, { color: theme.textMuted }]}>
            Provide your BVN or NIN to verify your identity
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Bank Verification Number (BVN)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your 11-digit BVN"
              placeholderTextColor={theme.textMuted}
              value={bvn}
              onChangeText={setBvn}
              keyboardType="numeric"
              maxLength={11}
            />
          </View>

          <View style={styles.orDivider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.orText, { color: theme.textMuted }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>National Identification Number (NIN)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your 11-digit NIN"
              placeholderTextColor={theme.textMuted}
              value={nin}
              onChangeText={setNin}
              keyboardType="numeric"
              maxLength={11}
            />
          </View>

          {/* Facial Verification */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Facial Verification</Text>
            <Text style={[styles.inputSubtitle, { color: theme.textMuted }]}>Take a clear selfie for identity verification</Text>
            
            {selfieImage ? (
              <View style={styles.selfieContainer}>
                <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
                <TouchableOpacity 
                  style={[styles.retakeButton, { backgroundColor: theme.primary }]}
                  onPress={takeSelfie}
                >
                  <Ionicons name="camera" size={16} color="white" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.selfieButton, { borderColor: theme.border, backgroundColor: theme.background }]}
                onPress={takeSelfie}
              >
                <Ionicons name="camera" size={32} color={theme.primary} />
                <Text style={[styles.selfieButtonText, { color: theme.text }]}>Take Selfie</Text>
                <Text style={[styles.selfieButtonSubtext, { color: theme.textMuted }]}>Tap to capture</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { opacity: isLoading ? 0.7 : 1 }]} 
            onPress={submitVerification}
            disabled={isLoading}
          >
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.submitGradient}>
              <Text style={styles.submitText}>
                {isLoading ? 'Verifying...' : 'Submit for Verification'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={[styles.benefitsCard, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.benefitsTitle, { color: theme.text }]}>Verification Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={20} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.textMuted }]}>Increased trust with buyers and sellers</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={20} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.textMuted }]}>Higher transaction limits</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={20} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.textMuted }]}>Priority customer support</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  selfieContainer: {
    alignItems: 'center',
    gap: 12,
  },
  selfieImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  retakeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selfieButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  selfieButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  selfieButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsCard: {
    padding: 20,
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
});