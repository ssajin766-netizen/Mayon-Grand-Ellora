import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  Text,
  ActivityIndicator,
  Button,
} from 'react-native-paper';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {
  useAppDispatch,
} from '../../store/hooks';

import {
  setAuthenticated,
  setUser,
} from '../../store/authSlice';

import api from '../../services/api';

import {
  saveMobileAuthToken,
} from '../../services/mobileAuthToken';

import {
  saveAuthState,
} from '../../services/authPersistence';


// ==========================================================
// BACKGROUND
// ==========================================================

const BACKGROUND_IMAGE =
  require('../../../assets/night.png');


// ==========================================================
// SCREEN
// ==========================================================

const PhoneOtpScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();

  const {
    phone,
  } = route.params as {
    phone: string;
  };

const [otp, setOtp] = useState('');
const [loading, setLoading] = useState(false);
const [seconds, setSeconds] = useState(60);

// Prevent double taps / duplicate OTP requests.
const verifyingRef = useRef(false);

// Prevent automatic verification from firing more than once
// for the same autofilled OTP.
const autoVerifyOtpRef = useRef('');


  // ========================================================
  // OTP TIMER
  // ========================================================

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(previous =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // ========================================================
  // VERIFY OTP
  // ========================================================

  const verifyOtp = async () => {
    if (verifyingRef.current) {
      console.log(
        'OTP VERIFY BLOCKED: already processing'
      );
      return;
    }

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      Alert.alert(
        'Error',
        'Please enter the OTP'
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      Alert.alert(
        'Error',
        'Please enter the 6-digit OTP'
      );
      return;
    }

    verifyingRef.current = true;
    setLoading(true);

    try {
      console.log(
        '========================================'
      );
      console.log('VERIFY PHONE OTP');
      console.log('OTP verification started');
      console.log(
        '========================================'
      );


      // ------------------------------------------------------
      // VERIFY OTP
      // ------------------------------------------------------

      const response = await api.post(
        '/api/auth/verify-phone-otp',
        {
          phoneNumber: phone,
          otp: cleanOtp,
        }
      );

      const data = response.data;

      console.log(
        '========== OTP VERIFY RESPONSE =========='
      );

      console.log(
        'Success:',
        data?.success
      );

      console.log(
        'Registration Required:',
        data?.registrationRequired
      );

      console.log(
        'Registration Token:',
        !!data?.registrationToken
      );

      console.log(
        'User received:',
        !!data?.user
      );

      console.log(
        'Token received:',
        !!data?.token
      );

      console.log(
        'Mobile Auth Token received:',
        !!data?.mobileAuthToken
      );

      // Never log either token value.
      console.log(
        'OTP response fields:',
        Object.keys(data || {})
      );

      console.log(
        '=========================================='
      );


      // ------------------------------------------------------
      // API-LEVEL FAILURE
      // ------------------------------------------------------

      if (!data?.success) {
        verifyingRef.current = false;
        setLoading(false);

          // Allow the user to retry the same/new OTP.
           autoVerifyOtpRef.current = '';

        Alert.alert(
          'Verification Failed',
          data?.message ||
            'OTP verification failed'
        );

        return;
      }


      // ======================================================
      // NEW USER
      // ======================================================

      if (data?.registrationRequired) {
        console.log(
          '========================================'
        );
        console.log('NEW USER DETECTED');
        console.log(
          'OPENING REGISTRATION'
        );
        console.log(
          '========================================'
        );


        if (!data?.registrationToken) {
          verifyingRef.current = false;
          setLoading(false);

          Alert.alert(
            'Registration Error',
            'Registration token was not received. Please request a new OTP.'
          );

          return;
        }


        // A new user must NOT become authenticated here.
        dispatch(setAuthenticated(false));
        dispatch(setUser(null));

        verifyingRef.current = false;
        setLoading(false);

        navigation.navigate(
          'RegisterDetails',
          {
            phone:
              data.phoneNumber ||
              phone,

            registrationToken:
              data.registrationToken,
          }
        );

        return;
      }

      // ------------------------------------------------------
      // STORE USER
      // ------------------------------------------------------

      if (data?.user) {
        dispatch(
          setUser(data.user)
        );
      }


// ======================================================
// AUTHENTICATION ORDER
// ======================================================
//
// 1. Verify the OTP response.
// 2. Persist mobileAuthToken securely.
// 3. Persist native authentication state.
// 4. Enable Redux authentication.
// 5. MainStack mounts.
// 6. WebViewContext creates the restore ticket.
// 7. WebViewComponent performs the one-time session hand-off.
// 8. Backend creates the Passport session.
// 9. Backend redirects to /home.
//
// IMPORTANT:
// PhoneOtpScreen must NOT directly navigate to
// /api/auth/mobile-webview-session.
//
// WebViewContext owns the WebView authentication hand-off
// after the MainStack is mounted.
// ======================================================

// ======================================================
// SAVE PERSISTENT MOBILE AUTH TOKEN
// ======================================================
//
// This token is the persistent mobile credential.
// It is stored in SecureStore.
//
// Persist BEFORE enabling Redux authentication.
// This prevents a partially authenticated app if
// SecureStore fails.
// ======================================================

      try {
  // ------------------------------------------------------
  // SAVE PERSISTENT MOBILE AUTH TOKEN
  // ------------------------------------------------------

  await saveMobileAuthToken(
    data.mobileAuthToken
  );

  console.log(
    'MOBILE AUTH TOKEN SAVED SUCCESSFULLY'
  );

  // ------------------------------------------------------
  // SAVE PERSISTENT NATIVE AUTH STATE
  // ------------------------------------------------------
  //
  // This is required so the app remains logged in after
  // being completely closed and reopened.
  //
  // mobileAuthToken = secure persistent credential
  // authState      = native persisted login state
  //
  // Both must exist for startup restoration.
  // ------------------------------------------------------

  if (!data?.user) {
    throw new Error(
      'User data missing — cannot persist authentication state'
    );
  }

  await saveAuthState(data.user);

  console.log(
    'AUTH STATE SAVED SUCCESSFULLY'
  );

} catch (storageError) {

  console.error(
    'PERSISTENT AUTH SAVE FAILED:',
    storageError
  );

  dispatch(
    setUser(null)
  );

  dispatch(
    setAuthenticated(false)
  );

  verifyingRef.current = false;
  setLoading(false);

  Alert.alert(
    'Login Error',
    'Unable to securely save your login session. Please try again.'
  );

  return;
}




// ======================================================
// WEBVIEW SESSION HAND-OFF
// ======================================================
//
// Do NOT navigate the WebView here.
//
// WebViewContext/MainStack owns the one-time restore
// ticket flow after authentication is enabled.
// ======================================================

     

    // ======================================================
    // ENABLE AUTHENTICATION
    // ======================================================

      dispatch(
         setAuthenticated(true)
      );

      // ------------------------------------------------------
      // FINISH OTP SCREEN
      // ------------------------------------------------------

      verifyingRef.current = false;
      setLoading(false);

      console.log(
        'OTP SUCCESSFUL'
      );

      console.log(
         'WEBVIEW RESTORE FLOW DELEGATED TO MAIN STACK'
      );

      console.log(
        'MAIN STACK AUTHENTICATION ENABLED'
      );

      console.log(
        '========================================'
      );

    } catch (error: any) {
      console.error(
        '========== OTP VERIFY ERROR =========='
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
        '======================================'
      );

      verifyingRef.current = false;
      setLoading(false);

      // Allow another OTP attempt.
      autoVerifyOtpRef.current = '';

      Alert.alert(
        'Verification Error',
        error?.response?.data?.message ||
          error?.message ||
          'Network error while verifying OTP'
      );
    }
  };

  // ========================================================
// ANDROID OTP AUTOFILL
// ========================================================

useEffect(() => {
  const cleanOtp = otp
    .replace(/\D/g, '')
    .slice(0, 6);

  if (cleanOtp !== otp) {
    setOtp(cleanOtp);
    return;
  }

  if (cleanOtp.length !== 6) {
    return;
  }

  if (loading || verifyingRef.current) {
    return;
  }

  if (autoVerifyOtpRef.current === cleanOtp) {
    return;
  }

  autoVerifyOtpRef.current = cleanOtp;

  console.log(
    '6-DIGIT OTP DETECTED - AUTO VERIFYING'
  );

  const timer = setTimeout(() => {
    verifyOtp();
  }, 300);

  return () => {
    clearTimeout(timer);
  };
}, [otp, loading]);


  // ========================================================
  // RESEND OTP
  // ========================================================

  const resendOtp = async () => {
    if (
      seconds > 0 ||
      loading ||
      verifyingRef.current
    ) {
      return;
    }

    try {
      console.log(
        '========================================'
      );

      console.log(
        'RESEND PHONE OTP'
      );

      console.log(
        '========================================'
      );

      const response = await api.post(
        '/api/auth/resend-otp',
        {
          phoneNumber: phone,
        }
      );

      if (response.data?.success === false) {
        Alert.alert(
          'Error',
          response.data?.message ||
            'Unable to resend OTP'
        );
        return;
      }

      setOtp('');
      setSeconds(60);

      autoVerifyOtpRef.current = '';

      Alert.alert(
      'OTP Sent',
      'A new OTP has been sent to your phone.'
      );

    } catch (error: any) {
      console.error(
        'Resend OTP error:',
        error?.response?.data ||
          error?.message
      );

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Unable to resend OTP'
      );
    }
  };


  // ========================================================
  // UI
  // ========================================================

  const resendDisabled =
    seconds > 0 ||
    loading ||
    verifyingRef.current;

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.background}
      resizeMode="cover"
    >
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

            <View style={styles.card}>

              {/* BRAND */}

              <Text
                variant="headlineMedium"
                style={styles.brand}
              >
                Mayon Grand Ellora
              </Text>

              <Text style={styles.brandSubtitle}>
                Resident Portal
              </Text>


              {/* TITLE */}

              <Text
                variant="headlineSmall"
                style={styles.title}
              >
                Enter OTP
              </Text>

              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code
              </Text>

              <Text style={styles.phone}>
                {phone}
              </Text>


              {/* OTP INPUT */}

              <TextInput
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#999"

              value={otp}

              onChangeText={(value) => {
              const cleanValue = value
              .replace(/\D/g, '')
              .slice(0, 6);

              setOtp(cleanValue);
              }}

              style={styles.input}

              keyboardType="number-pad"

              maxLength={6}

              autoFocus

              textAlign="center"

              returnKeyType="done"

              editable={!loading}

           // Android OTP autofill
               autoComplete="sms-otp"

           // iOS one-time-code support
              textContentType="oneTimeCode"

           // Tell Android this field participates
          // in autofill.
              importantForAutofill="yes"

              onSubmitEditing={() => {
              if (
              !loading &&
              otp.length === 6
              ) {
              verifyOtp();
             }
             }}
             />


              {/* VERIFY */}

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
                    Verifying OTP...
                  </Text>
                </View>
              ) : (
                <Button
                  mode="contained"
                  onPress={verifyOtp}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={
                    styles.buttonContent
                  }
                  buttonColor="#d88900"
                  textColor="#fff"
                >
                  Verify OTP
                </Button>
              )}


              {/* TIMER */}

              <Text style={styles.timer}>
                {seconds > 0
                  ? `Resend OTP in ${String(
                      Math.floor(
                        seconds / 60
                      )
                    ).padStart(
                      2,
                      '0'
                    )}:${String(
                      seconds % 60
                    ).padStart(
                      2,
                      '0'
                    )}`
                  : 'You can request a new OTP'
                }
              </Text>


              {/* RESEND */}

              <TouchableOpacity
                disabled={resendDisabled}
                onPress={resendOtp}
                style={[
                  styles.resendButton,
                  {
                    opacity:
                      resendDisabled
                        ? 0.45
                        : 1,
                  },
                ]}
              >
                <Text
                  style={
                    styles.resendText
                  }
                >
                  Resend OTP
                </Text>
              </TouchableOpacity>


              {/* SECURITY */}

              <Text
                style={
                  styles.securityText
                }
              >
                Your verification code is private and secure.
              </Text>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </View>
    </ImageBackground>
  );
};


// ==========================================================
// STYLES
// ==========================================================

const styles = StyleSheet.create({

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

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
    marginBottom: 8,
  },

  phone: {
    color: '#ffb13b',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 22,
  },

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
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 8,
  },

  button: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
  },

  buttonContent: {
    height: 52,
  },

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

  timer: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 10,
  },

  resendButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  resendText: {
    color: '#ff9d00',
    fontSize: 15,
    fontWeight: '600',
  },

  securityText: {
    color: '#777',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 18,
  },

});

export default PhoneOtpScreen;