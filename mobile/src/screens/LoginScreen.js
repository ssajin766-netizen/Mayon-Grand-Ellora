import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { sendPhoneOtp, loginWithGoogle, loginWithEmail, error, setError } = useContext(AuthContext);

  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'google' | 'email'
  
  // Phone state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading state
  const [submitting, setSubmitting] = useState(false);

  // Handle Phone OTP Submission
  const handlePhoneSubmit = async () => {
    const rawPhone = phoneNumber.trim();
    if (!rawPhone) {
      Alert.alert('Required', 'Please enter a valid mobile number.');
      return;
    }

    const fullPhone = `${countryCode}${rawPhone.replace(/\D/g, '')}`;
    
    setSubmitting(true);
    setError(null);

    const result = await sendPhoneOtp(fullPhone);
    setSubmitting(false);

    if (result.success) {
      navigation.navigate('OtpVerification', { phoneNumber: fullPhone });
    } else {
      Alert.alert('Error', result.message || 'Failed to send OTP. Please check the mobile number.');
    }
  };

  // Handle Google Sign-In
  const handleGoogleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    // In Expo / React Native environment, Google Auth Session or direct OAuth token is used.
    // For demo/mobile test, we send Google profile request to backend API.
    const result = await loginWithGoogle({
      email: 'resident@esociety.com',
      googleId: 'google-mobile-user-123',
      firstName: 'Resident',
      lastName: 'User'
    });
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Google Sign-In Error', result.message || 'Unable to complete Google Sign-In.');
    }
  };

  // Handle Email/Password Submission
  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await loginWithEmail(email.trim(), password.trim());
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Login Error', result.message || 'Invalid email or password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="business" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Mayon Grand Ellora</Text>
            <Text style={styles.subtitle}>Community & Apartment Management System</Text>
          </View>

          {/* Login Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'phone' && styles.activeTab]}
              onPress={() => { setLoginMethod('phone'); setError(null); }}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={loginMethod === 'phone' ? COLORS.white : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, loginMethod === 'phone' && styles.activeTabText]}>
                Phone OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, loginMethod === 'google' && styles.activeTab]}
              onPress={() => { setLoginMethod('google'); setError(null); }}
            >
              <FontAwesome
                name="google"
                size={16}
                color={loginMethod === 'google' ? COLORS.white : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, loginMethod === 'google' && styles.activeTabText]}>
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, loginMethod === 'email' && styles.activeTab]}
              onPress={() => { setLoginMethod('email'); setError(null); }}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={loginMethod === 'email' ? COLORS.white : COLORS.textSecondary}
              />
              <Text style={[styles.tabText, loginMethod === 'email' && styles.activeTabText]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            {/* MODE 1: PHONE LOGIN */}
            {loginMethod === 'phone' && (
              <View>
                <Text style={styles.formTitle}>Phone Login</Text>
                <Text style={styles.formSubtitle}>
                  Enter your mobile number to receive a 6-digit OTP code.
                </Text>

                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryPicker}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98765 43210"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={12}
                  />
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handlePhoneSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Send OTP Code</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoText}>
                    An OTP SMS will be sent via SMS verification. Standard message rates may apply.
                  </Text>
                </View>
              </View>
            )}

            {/* MODE 2: GOOGLE LOGIN */}
            {loginMethod === 'google' && (
              <View style={styles.googleContainer}>
                <Text style={styles.formTitle}>Sign In with Google</Text>
                <Text style={styles.formSubtitle}>
                  Use your registered Google Account for one-tap instant login.
                </Text>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={COLORS.text} />
                  ) : (
                    <>
                      <FontAwesome name="google" size={20} color={COLORS.googleRed} style={{ marginRight: 12 }} />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.googleHelpCard}>
                  <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
                  <Text style={styles.googleHelpText}>
                    Fast, secure, and password-free authentication verified by Google OAuth 2.0.
                  </Text>
                </View>
              </View>
            )}

            {/* MODE 3: EMAIL LOGIN */}
            {loginMethod === 'email' && (
              <View>
                <Text style={styles.formTitle}>Email & Password</Text>
                <Text style={styles.formSubtitle}>
                  Sign in with your registered account credentials.
                </Text>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="user@esociety.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleEmailSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>QUICK SWITCH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Switch Buttons */}
            <View style={styles.quickSwitchRow}>
              {loginMethod !== 'phone' && (
                <TouchableOpacity
                  style={styles.quickSwitchBtn}
                  onPress={() => { setLoginMethod('phone'); setError(null); }}
                >
                  <Ionicons name="phone-portrait" size={16} color={COLORS.primary} />
                  <Text style={styles.quickSwitchText}>Phone Login</Text>
                </TouchableOpacity>
              )}

              {loginMethod !== 'google' && (
                <TouchableOpacity
                  style={styles.quickSwitchBtn}
                  onPress={() => { setLoginMethod('google'); setError(null); }}
                >
                  <FontAwesome name="google" size={14} color={COLORS.googleRed} />
                  <Text style={styles.quickSwitchText}>Google Login</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            © 2026 Mayon Grand Ellora. All Rights Reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray200,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  countryPicker: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  phoneInput: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  primaryButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 16,
  },
  googleContainer: {
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    height: 54,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  googleHelpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    gap: 10,
  },
  googleHelpText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  quickSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  quickSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  quickSwitchText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
