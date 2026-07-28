import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function OtpScreen({ route, navigation }) {
  const { phoneNumber } = route.params || {};
  const { verifyPhoneOtp, sendPhoneOtp } = useContext(AuthContext);

  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.trim().length < 4) {
      Alert.alert('Required', 'Please enter the full 6-digit OTP.');
      return;
    }

    setSubmitting(true);
    const result = await verifyPhoneOtp(phoneNumber, otp.trim());
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Verification Failed', result.message || 'Invalid OTP code.');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    const result = await sendPhoneOtp(phoneNumber);
    if (result.success) {
      Alert.alert('Success', 'A new OTP code has been sent to your mobile number.');
    } else {
      Alert.alert('Error', result.message || 'Failed to resend OTP.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="keypad" size={40} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Enter OTP Code</Text>
          <Text style={styles.subtitle}>
            Code sent to <Text style={styles.phoneHighlight}>{phoneNumber || 'your phone'}</Text>
          </Text>

          <View style={styles.otpCard}>
            <Text style={styles.label}>6-Digit Verification Code</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="••••••"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />

            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerify}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.verifyBtnText}>Verify & Login</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendTimer > 0}
              >
                <Text
                  style={[
                    styles.resendBtnText,
                    resendTimer > 0 && styles.disabledResendText
                  ]}
                >
                  {resendTimer > 0 ? ` Resend in ${resendTimer}s` : ' Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: COLORS.text,
  },
  otpCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInput: {
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 10,
    color: COLORS.text,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  verifyBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  disabledResendText: {
    color: '#9CA3AF',
  },
});
