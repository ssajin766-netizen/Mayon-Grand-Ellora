import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';

import {
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';

import { useRoute } from '@react-navigation/native';

import { useAppDispatch } from '../../store/hooks';

import {
  setAuthenticated,
  setUser,
} from '../../store/authSlice';

import api from '../../services/api';

import { useWebView } from '../../context/WebViewContext';

const PhoneOtpScreen = () => {
  const route = useRoute();

  const dispatch = useAppDispatch();

  const { phone } =
    route.params as { phone: string };

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const {
    navigate: navigateWebView,
  } = useWebView();

  // ==================================================
  // OTP TIMER
  // ==================================================

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // ==================================================
  // VERIFY OTP
  // ==================================================

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert(
        'Error',
        'Please enter the OTP'
      );

      return;
    }

    setLoading(true);

    try {
      const resp = await api.post(
        '/api/auth/verify-phone-otp',
        {
          phoneNumber: phone,
          otp,
        }
      );

      // ==================================================
      // DEBUG RESPONSE
      // ==================================================

      console.log(
        '========== OTP VERIFY RESPONSE =========='
      );

      console.log(
        'Success:',
        resp.data?.success
      );

      console.log(
        'User received:',
        !!resp.data?.user
      );

      console.log(
        'Token received:',
        !!resp.data?.token
      );

      console.log(
        'Token length:',
        resp.data?.token
          ? resp.data.token.length
          : 0
      );

      console.log(
        '=========================================='
      );

      // ==================================================
      // OTP VERIFICATION FAILED
      // ==================================================

      if (!resp.data?.success) {
        Alert.alert(
          'Error',
          resp.data?.message ||
            'OTP verification failed'
        );

        return;
      }

      // ==================================================
      // WEBVIEW TOKEN REQUIRED
      // ==================================================

      if (!resp.data?.token) {
        console.error(
          'OTP verification succeeded but WebView token is missing'
        );

        Alert.alert(
          'Login Error',
          'Authentication token was not received. Please try again.'
        );

        return;
      }

      // ==================================================
      // CREATE WEBVIEW SESSION URL
      // ==================================================

      const sessionUrl =
        `/api/auth/mobile-webview-session?token=${encodeURIComponent(
          resp.data.token
        )}`;

      console.log(
        'WEBVIEW SESSION URL:',
        sessionUrl.replace(
          /token=[^&]+/,
          'token=[REDACTED]'
        )
      );

      // ==================================================
      // STORE WEBVIEW URL
      // ==================================================

      navigateWebView(sessionUrl);

      // ==================================================
      // SAVE USER
      // ==================================================

      if (resp.data.user) {
        dispatch(
          setUser(resp.data.user)
        );
      }

      // ==================================================
      // AUTHENTICATE APP
      // ==================================================

      dispatch(
        setAuthenticated(true)
      );

    } catch (e: any) {
      console.error(
        '========== OTP VERIFY ERROR =========='
      );

      console.error(
        'Message:',
        e?.message
      );

      console.error(
        'Status:',
        e?.response?.status
      );

      console.error(
        'Response:',
        e?.response?.data
      );

      console.error(
        '======================================'
      );

      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          e?.message ||
          'Network error while verifying OTP'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // RESEND OTP
  // ==================================================

  const resendOtp = async () => {
    try {
      await api.post(
        '/api/auth/resend-otp',
        {
          phoneNumber: phone,
        }
      );

      setSeconds(60);

    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message ||
          'Unable to resend OTP'
      );
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <View style={styles.container}>

      <Text
        variant="headlineMedium"
        style={styles.title}
      >
        Enter OTP
      </Text>

      <Text style={styles.subtitle}>
        Sent to {phone}
      </Text>

      <TextInput
        placeholder="123456"
        placeholderTextColor="#888"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          mode="contained"
          onPress={verifyOtp}
          style={styles.button}
        >
          Verify OTP
        </Button>
      )}

      <Text style={styles.timer}>
        {String(
          Math.floor(seconds / 60)
        ).padStart(2, '0')}
        :
        {String(
          seconds % 60
        ).padStart(2, '0')}
      </Text>

      <TouchableOpacity
        disabled={seconds > 0}
        onPress={resendOtp}
        style={[
          styles.resendButton,
          {
            opacity:
              seconds > 0 ? 0.5 : 1,
          },
        ]}
      >
        <Text style={styles.resendText}>
          Resend OTP
        </Text>
      </TouchableOpacity>

    </View>
  );
};

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },

  title: {
    color: '#ff8c00',
    marginBottom: 16,
  },

  subtitle: {
    color: '#fff',
    marginBottom: 20,
  },

  input: {
    width: '80%',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },

  button: {
    width: '80%',
    marginBottom: 10,
  },

  timer: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 18,
  },

  resendButton: {},

  resendText: {
    color: '#ff8c00',
  },
});

export default PhoneOtpScreen;