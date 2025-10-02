import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function SignupScreen() {
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }, 2000);
  };

  const handleSocialSignup = (provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Social Signup', `${provider} signup coming soon!`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={[styles.logoContainer, { backgroundColor: theme.primaryGlow }]}>
              <Ionicons name="car-sport" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Join AutoBoy and start trading</Text>
          </View>

          {/* Form */}
          <BlurView intensity={20} tint={theme.name === 'dark' ? 'dark' : 'light'} style={[styles.formContainer, { backgroundColor: theme.backgroundAlt + '80', borderColor: theme.border }]}>
            <View style={styles.form}>
              {/* Name Inputs */}
              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>First Name</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="person-outline" size={20} color={theme.textMuted} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="First name"
                      placeholderTextColor={theme.textMuted}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Last Name</Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="person-outline" size={20} color={theme.textMuted} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="Last name"
                      placeholderTextColor={theme.textMuted}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.textMuted} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="call-outline" size={20} color={theme.textMuted} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="+234 801 234 5678"
                    placeholderTextColor={theme.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Create password"
                    placeholderTextColor={theme.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={theme.textMuted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Confirm password"
                    placeholderTextColor={theme.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={theme.textMuted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View style={[styles.checkbox, { backgroundColor: agreeToTerms ? theme.primary : 'transparent', borderColor: theme.border }]}>
                  {agreeToTerms && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={[styles.termsText, { color: theme.textMuted }]}>
                  I agree to the <Text style={[styles.termsLink, { color: theme.primary }]}>Terms of Service</Text> and{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Signup Button */}
              <TouchableOpacity 
                style={[styles.signupBtn, { opacity: isLoading ? 0.7 : 1 }]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.signupBtnGradient}>
                  {isLoading ? (
                    <Text style={styles.signupBtnText}>Creating Account...</Text>
                  ) : (
                    <Text style={styles.signupBtnText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>or sign up with</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              {/* Social Signup */}
              <View style={styles.socialContainer}>
                <TouchableOpacity 
                  style={[styles.socialBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => handleSocialSignup('Google')}
                >
                  <Ionicons name="logo-google" size={24} color="#EA4335" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.socialBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => handleSocialSignup('Apple')}
                >
                  <Ionicons name="logo-apple" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.socialBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => handleSocialSignup('Facebook')}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: theme.textMuted }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={[styles.loginLink, { color: theme.primary }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 0,
    padding: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  form: {
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  signupBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signupBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});