import React, { useState } from 'react';

import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';

import { useNavigation } from '@react-navigation/native';

import api from '../../services/api';

// ==================================================
// BACKGROUND IMAGE
// ==================================================
//
// PhoneLoginScreen is located at:
//
// mobile-app/src/screens/auth/PhoneLoginScreen.tsx
//
// Therefore:
//
// ../../../assets/night.png
//
// points to:
//
// mobile-app/assets/night.png
//

const BACKGROUND_IMAGE =
  require('../../../assets/night.png');

// ==================================================
// PHONE LOGIN SCREEN
// ==================================================

const PhoneLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  // ==================================================
  // REQUEST OTP
  // ==================================================

  const requestOtp = async () => {
    if (!phone.trim()) {
      Alert.alert(
        'Error',
        'Please enter a phone number'
      );

      return;
    }

    // Remove spaces
    const cleanPhone = phone.trim();

    // Accept:
    // +919876543210
    // 919876543210
    // 9876543210
    const formattedPhone =
      cleanPhone.startsWith('+')
        ? cleanPhone
        : `+91${cleanPhone}`;

    // Basic Indian phone validation
    const phoneDigits =
      formattedPhone.replace(/\D/g, '');

    if (phoneDigits.length !== 12) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit Indian mobile number.'
      );

      return;
    }

    setLoading(true);

    try {
      console.log(
        '========================================'
      );

      console.log(
        'PHONE OTP REQUEST'
      );

      console.log(
        'API URL:',
        process.env.EXPO_PUBLIC_API_BASE_URL
      );

      console.log(
        'Phone:',
        formattedPhone
      );

      console.log(
        '========================================'
      );

      const resp = await api.post(
        '/api/auth/send-phone-otp',
        {
          phoneNumber: formattedPhone,
        }
      );

      console.log(
        'OTP RESPONSE:',
        resp.data
      );

      if (resp.data?.success) {

        navigation.navigate(
          'PhoneOtp',
          {
            phone: formattedPhone,
          }
        );

        return;
      }

      Alert.alert(
        'Error',
        resp.data?.message ||
          'Failed to request OTP'
      );

    } catch (error: any) {

      console.error(
        '========== SEND OTP ERROR =========='
      );

      console.error(
        'Message:',
        error?.message
      );

      console.error(
        'Status:',
        error?.response?.status
      );

      console.error(
        'Response:',
        error?.response?.data
      );

      console.error(
        '===================================='
      );

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'Network error while requesting OTP'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.background}
      resizeMode="cover"
    >

      {/* ==================================================
          DARK OVERLAY
      ================================================== */}

      <View style={styles.overlay}>

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ==================================================
                LOGIN CARD
            ================================================== */}

            <View style={styles.card}>

              {/* ==================================================
                  BRAND
              ================================================== */}

              <Text
                variant="headlineMedium"
                style={styles.brand}
              >
                Mayon Grand Ellora
              </Text>

              <Text
                style={styles.brandSubtitle}
              >
                Resident Portal
              </Text>

              {/* ==================================================
                  TITLE
              ================================================== */}

              <Text
                variant="headlineSmall"
                style={styles.title}
              >
                Welcome
              </Text>

              <Text
                style={styles.subtitle}
              >
                Enter your mobile number to
                login or create an account
              </Text>

              {/* ==================================================
                  PHONE INPUT
              ================================================== */}

              <TextInput
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={13}
                autoComplete="tel"
                textContentType="telephoneNumber"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={requestOtp}
              />

              {/* ==================================================
                  SEND OTP
              ================================================== */}

              {loading ? (

                <View
                  style={
                    styles.loadingContainer
                  }
                >

                  <ActivityIndicator
                    size="small"
                    color="#ff9d00"
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Sending OTP...
                  </Text>

                </View>

              ) : (

                <Button
                  mode="contained"
                  onPress={requestOtp}
                  style={styles.button}
                  contentStyle={
                    styles.buttonContent
                  }
                  buttonColor="#d88900"
                  textColor="#fff"
                >
                  Send OTP
                </Button>

              )}

              

              {/* ==================================================
                  SECURITY MESSAGE
              ================================================== */}

              <Text
                style={styles.securityText}
              >
                Your phone number will be
                 verified using OTP.
              </Text>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </View>

    </ImageBackground>
  );
};

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  // ==================================================
  // BACKGROUND
  // ==================================================

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // ==================================================
  // OVERLAY
  // ==================================================

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.48)',
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  // ==================================================
  // CARD
  // ==================================================

  card: {
    width: '100%',
    maxWidth: 420,

    paddingHorizontal: 26,
    paddingVertical: 30,

    borderRadius: 24,

    backgroundColor:
      'rgba(15, 15, 15, 0.86)',

    borderWidth: 1,

    borderColor:
      'rgba(255, 157, 0, 0.35)',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.35,
    shadowRadius: 20,

    elevation: 12,
  },

  // ==================================================
  // BRAND
  // ==================================================

  brand: {
    color: '#ff9d00',

    textAlign: 'center',

    fontWeight: 'bold',

    marginBottom: 4,
  },

  brandSubtitle: {
    color: '#ddd',

    textAlign: 'center',

    fontSize: 13,

    marginBottom: 28,

    letterSpacing: 1,
  },

  // ==================================================
  // TITLE
  // ==================================================

  title: {
    color: '#fff',

    textAlign: 'center',

    fontWeight: '600',

    marginBottom: 8,
  },

  subtitle: {
    color: '#bbb',

    textAlign: 'center',

    fontSize: 14,

    marginBottom: 24,

    lineHeight: 20,
  },

  // ==================================================
  // INPUT
  // ==================================================

  input: {
    width: '100%',

    height: 56,

    backgroundColor:
      'rgba(255, 255, 255, 0.10)',

    color: '#fff',

    borderRadius: 12,

    borderWidth: 1,

    borderColor:
      'rgba(255, 255, 255, 0.18)',

    paddingHorizontal: 16,

    marginBottom: 18,

    fontSize: 16,
  },

  // ==================================================
  // BUTTON
  // ==================================================

  button: {
    width: '100%',

    borderRadius: 12,

    marginBottom: 16,
  },

  buttonContent: {
    height: 52,
  },

  // ==================================================
  // LOADING
  // ==================================================

  loadingContainer: {
    height: 52,

    width: '100%',

    justifyContent: 'center',

    alignItems: 'center',

    flexDirection: 'row',

    marginBottom: 16,
  },

  loadingText: {
    color: '#ff9d00',

    marginLeft: 10,

    fontSize: 14,
  },

  // ==================================================
  // SECURITY
  // ==================================================

  securityText: {
    color: '#777',

    textAlign: 'center',

    fontSize: 11,

    marginTop: 8,
  },

});

export default PhoneLoginScreen;