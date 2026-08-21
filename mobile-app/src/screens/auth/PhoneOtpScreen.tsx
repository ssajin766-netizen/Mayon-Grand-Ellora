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
  useWebView,
} from '../../context/WebViewContext';

import {
  saveMobileAuthToken,
} from '../../services/mobileAuthToken';


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

  const {
    navigate: navigateWebView,
  } = useWebView();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);

  // Prevent double taps / duplicate OTP requests.
  const verifyingRef = useRef(false);


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


      // ======================================================
      // EXISTING USER
      // ======================================================

      console.log(
        '========================================'
      );
      console.log('EXISTING USER LOGIN');
      console.log(
        '========================================'
      );


      // ------------------------------------------------------
      // TOKEN IS REQUIRED FOR WEBVIEW SESSION HANDOFF
      // ------------------------------------------------------

      if (!data?.token) {
        verifyingRef.current = false;
        setLoading(false);

        console.error(
          'OTP succeeded but WebView token is missing'
        );

        Alert.alert(
          'Login Error',
          'Authentication token was not received. Please try again.'
        );

        return;
      }

      if (!data?.mobileAuthToken) {

        verifyingRef.current = false;
        setLoading(false);

        console.error(
        'OTP succeeded but persistent mobile auth token is missing'
        );

        Alert.alert(
        'Login Error',
        'Persistent authentication token was not received. Please try again.'
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


      // ------------------------------------------------------
      // CREATE ONE-TIME WEBVIEW SESSION URL
      // ------------------------------------------------------

      const sessionUrl =
        `/api/auth/mobile-webview-session?token=${encodeURIComponent(
          data.token
        )}`;

      console.log(
        'WEBVIEW SESSION URL:',
        sessionUrl.replace(
          /token=[^&]+/,
          'token=[REDACTED]'
        )
      );


      // ======================================================
      // IMPORTANT AUTHENTICATION ORDER
      // ======================================================
      //
      // 1. Validate both server-issued tokens.
      // 2. Persist mobileAuthToken securely.
      // 3. Put the one-time session URL into WebViewContext.
      // 4. Authenticate the native Redux tree.
      // 5. MainStack mounts.
      // 6. WebViewComponent consumes the pending URL.
      // 7. Backend creates the Passport session.
      // 8. Backend redirects to /home.
      //
      // Do NOT navigate to "Main" or "Home" here because those
      // are not necessarily routes in AuthStack.
      // ======================================================
// ======================================================
     // SAVE PERSISTENT MOBILE AUTH TOKEN
     // ======================================================
      // ======================================================
      // SAVE PERSISTENT MOBILE AUTH TOKEN
      // ======================================================
      //
      // This token is the persistent mobile credential.
      // It is stored in SecureStore and is intentionally kept
      // separate from data.token, which is a one-time WebView
      // session hand-off token.
      //
      // Persist BEFORE enabling Redux authentication or starting
      // the WebView hand-off. This prevents a partially
      // authenticated app if SecureStore fails.
      // ======================================================

      try {

        await saveMobileAuthToken(
          data.mobileAuthToken
        );

        console.log(
          'MOBILE AUTH TOKEN SAVED SUCCESSFULLY'
        );

      } catch (storageError) {

        console.error(
          'MOBILE AUTH TOKEN SAVE FAILED'
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
      // START ONE-TIME WEBVIEW SESSION HAND-OFF
      // ======================================================
      //
      // data.token is intentionally NOT persisted. It is a
      // short-lived, one-time token consumed by the backend.
      // ======================================================

      navigateWebView(sessionUrl);

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
        'WEBVIEW HAND-OFF STARTED'
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

      Alert.alert(
        'Verification Error',
        error?.response?.data?.message ||
          error?.message ||
          'Network error while verifying OTP'
      );
    }
  };


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
                onChangeText={setOtp}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                textAlign="center"
                returnKeyType="done"
                editable={!loading}
                onSubmitEditing={() => {
                  if (!loading) {
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