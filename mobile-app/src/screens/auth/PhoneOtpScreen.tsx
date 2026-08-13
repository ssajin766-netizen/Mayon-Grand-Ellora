import React, {
  useState,
  useEffect,
} from 'react';

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
  Button,
  Text,
  ActivityIndicator,
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


// ==================================================
// BACKGROUND IMAGE
// ==================================================

const BACKGROUND_IMAGE =
  require('../../../assets/night.png');


// ==================================================
// OTP SCREEN
// ==================================================

const PhoneOtpScreen = () => {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();

  const dispatch =
    useAppDispatch();

  const {
    phone,
  } = route.params as {
    phone: string;
  };


  const [otp, setOtp] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [seconds, setSeconds] =
    useState(60);


  const {
    navigate: navigateWebView,
  } = useWebView();


  // ==================================================
  // OTP TIMER
  // ==================================================

  useEffect(() => {

    if (
      seconds <= 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {

        setSeconds(
          previous =>
            previous > 0
              ? previous - 1
              : 0
        );

      }, 1000);


    return () =>
      clearInterval(timer);

  }, [seconds]);


  // ==================================================
  // VERIFY OTP
  // ==================================================

  const verifyOtp =
    async () => {

      if (!otp) {

        Alert.alert(
          'Error',
          'Please enter the OTP'
        );

        return;
      }


      if (
        otp.length !== 6
      ) {

        Alert.alert(
          'Error',
          'Please enter the 6-digit OTP'
        );

        return;
      }


      setLoading(true);


      try {

        const resp =
          await api.post(
            '/api/auth/verify-phone-otp',
            {
              phoneNumber:
                phone,

              otp,
            }
          );


        console.log(
          '========== OTP VERIFY RESPONSE =========='
        );

        console.log(
          'Success:',
          resp.data?.success
        );

        console.log(
          'Registration Required:',
          resp.data
            ?.registrationRequired
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
          '=========================================='
        );


        // ==================================================
        // ERROR
        // ==================================================

        if (
          !resp.data?.success
        ) {

          Alert.alert(
            'Error',
            resp.data?.message ||
              'OTP verification failed'
          );

          return;
        }


        // ==================================================
        // NEW USER
        // ==================================================
        //
        // OTP has already been verified.
        //
        // Do NOT ask for OTP again.
        //
        // Open registration details screen.
        //

        if (
          resp.data
            ?.registrationRequired
        ) {

          if (
            !resp.data?.registrationToken
          ) {

            Alert.alert(
              'Registration Error',
              'Registration token was not received. Please try again.'
            );

            return;
          }


          navigation.navigate(
            'RegisterDetails',
            {

              phone:
                resp.data.phoneNumber ||
                phone,

              registrationToken:
                resp.data.registrationToken,

            }
          );


          return;
        }


        // ==================================================
        // EXISTING USER
        // ==================================================

        if (
          !resp.data?.token
        ) {

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
        // STORE WEBVIEW URL FIRST
        // ==================================================

        navigateWebView(
          sessionUrl
        );


        // ==================================================
        // SAVE USER
        // ==================================================

        if (
          resp.data?.user
        ) {

          dispatch(
            setUser(
              resp.data.user
            )
          );

        }


        // ==================================================
        // AUTHENTICATE APP
        // ==================================================

        dispatch(
          setAuthenticated(
            true
          )
        );


      }

      catch (
        error: any
      ) {

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


        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            error?.message ||
            'Network error while verifying OTP'
        );

      }

      finally {

        setLoading(false);

      }

    };


  // ==================================================
  // RESEND OTP
  // ==================================================

  const resendOtp =
    async () => {

      if (
        seconds > 0 ||
        loading
      ) {
        return;
      }


      try {

        await api.post(
          '/api/auth/resend-otp',
          {
            phoneNumber:
              phone,
          }
        );


        setOtp('');

        setSeconds(60);


        Alert.alert(
          'OTP Sent',
          'A new OTP has been sent to your phone.'
        );


      }

      catch (
        error: any
      ) {

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


  // ==================================================
  // UI
  // ==================================================

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
            showsVerticalScrollIndicator={
              false
            }
          >

            <View style={styles.card}>

              {/* BRAND */}

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


              {/* TITLE */}

              <Text
                variant="headlineSmall"
                style={styles.title}
              >
                Enter OTP
              </Text>


              <Text
                style={styles.subtitle}
              >
                We've sent a 6-digit
                verification code
              </Text>


              <Text
                style={styles.phone}
              >
                {phone}
              </Text>


              {/* OTP INPUT */}

              <TextInput
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#999"
                value={otp}
                onChangeText={
                  setOtp
                }
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                textAlign="center"
                returnKeyType="done"
                editable={!loading}
                onSubmitEditing={
                  verifyOtp
                }
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
                  onPress={
                    verifyOtp
                  }
                  style={
                    styles.button
                  }
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

              <Text
                style={styles.timer}
              >

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
                disabled={
                  seconds > 0 ||
                  loading
                }
                onPress={
                  resendOtp
                }
                style={[
                  styles.resendButton,
                  {
                    opacity:
                      seconds > 0 ||
                      loading
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
                Your verification code
                is private and secure.
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

const styles =
  StyleSheet.create({

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