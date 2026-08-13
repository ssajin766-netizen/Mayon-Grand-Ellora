import React, {
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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

import api from '../../services/api';


// ==================================================
// BACKGROUND
// ==================================================

const BACKGROUND_IMAGE =
  require('../../../assets/night.png');


// ==================================================
// SCREEN
// ==================================================

const RegisterDetailsScreen =
  () => {

    const navigation =
      useNavigation<any>();

    const route =
      useRoute<any>();


    const {
      phone,
      registrationToken,
    } = route.params as {

      phone: string;

      registrationToken:
        string;

    };


    // ==================================================
    // FORM STATE
    // ==================================================

    const [firstName, setFirstName] =
      useState('');

    const [lastName, setLastName] =
      useState('');

    const [email, setEmail] =
      useState('');

    const [societyName, setSocietyName] =
      useState('Mayon Grand Ellora');

    const [flatNumber, setFlatNumber] =
      useState('');

    const [loading, setLoading] =
      useState(false);


    // ==================================================
    // VALIDATE EMAIL
    // ==================================================

    const isValidEmail =
      (value: string) => {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(
            value.trim()
          );

      };


    // ==================================================
    // REGISTER
    // ==================================================

    const completeRegistration =
      async () => {

        const cleanFirstName =
          firstName.trim();

        const cleanLastName =
          lastName.trim();

        const cleanEmail =
          email
            .trim()
            .toLowerCase();

        const cleanSocietyName =
          societyName.trim();

        const cleanFlatNumber =
          flatNumber.trim();


        /*
        ------------------------------------------
        FIRST NAME
        ------------------------------------------
        */

        if (!cleanFirstName) {

          Alert.alert(
            'Required',
            'Please enter your first name.'
          );

          return;

        }


        /*
        ------------------------------------------
        LAST NAME
        ------------------------------------------
        */

        if (!cleanLastName) {

          Alert.alert(
            'Required',
            'Please enter your last name.'
          );

          return;

        }


        /*
        ------------------------------------------
        EMAIL
        ------------------------------------------
        */

        if (!cleanEmail) {

          Alert.alert(
            'Required',
            'Please enter your email address.'
          );

          return;

        }


        if (
          !isValidEmail(
            cleanEmail
          )
        ) {

          Alert.alert(
            'Invalid Email',
            'Please enter a valid email address.'
          );

          return;

        }


        /*
        ------------------------------------------
        SOCIETY
        ------------------------------------------
        */

        if (!cleanSocietyName) {

          Alert.alert(
            'Required',
            'Please enter your society name.'
          );

          return;

        }


        /*
        ------------------------------------------
        FLAT
        ------------------------------------------
        */

        if (!cleanFlatNumber) {

          Alert.alert(
            'Required',
            'Please enter your flat number.'
          );

          return;

        }


        setLoading(true);


        try {

          console.log(
            '========================================'
          );

          console.log(
            'COMPLETE PHONE REGISTRATION'
          );

          console.log(
            'Phone:',
            phone
          );

          console.log(
            'Email:',
            cleanEmail
          );

          console.log(
            'Society:',
            cleanSocietyName
          );

          console.log(
            'Flat:',
            cleanFlatNumber
          );

          console.log(
            '========================================'
          );


          const response =
            await api.post(

              '/api/auth/complete-phone-registration',

              {

                registrationToken,

                firstName:
                  cleanFirstName,

                lastName:
                  cleanLastName,

                email:
                  cleanEmail,

                societyName:
                  cleanSocietyName,

                flatNumber:
                  cleanFlatNumber,

              }

            );


          console.log(
            'REGISTRATION RESPONSE:',
            response.data
          );


          if (
            !response.data?.success
          ) {

            Alert.alert(

              'Registration Failed',

              response.data?.message ||
                'Unable to create your account.'

            );

            return;

          }


          /*
          ========================================
          SUCCESS
          ========================================
          */

          Alert.alert(

            'Registration Successful',

            'Your account has been created successfully and is waiting for administrator approval.',

            [

              {

                text: 'OK',

                onPress: () => {

                  navigation.reset({

                    index: 0,

                    routes: [

                      {
                        name:
                          'PhoneLogin',
                      },

                    ],

                  });

                },

              },

            ]

          );


        }

        catch (
          error: any
        ) {

          console.error(
            'COMPLETE REGISTRATION ERROR:',
            error?.response?.data ||
              error?.message
          );


          Alert.alert(

            'Registration Failed',

            error?.response?.data?.message ||
              error?.message ||
              'Unable to create your account.'

          );

        }

        finally {

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
                  Create Account
                </Text>


                <Text
                  style={styles.subtitle}
                >
                  Your phone number has been
                  verified. Complete your
                  resident details.
                </Text>


                {/* VERIFIED PHONE */}

                <View
                  style={
                    styles.verifiedBox
                  }
                >

                  <Text
                    style={
                      styles.verifiedLabel
                    }
                  >
                    Verified mobile number
                  </Text>


                  <Text
                    style={
                      styles.verifiedPhone
                    }
                  >
                    {phone}
                  </Text>

                </View>


                {/* FIRST NAME */}

                <TextInput
                  placeholder="First name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={
                    setFirstName
                  }
                  style={styles.input}
                  editable={!loading}
                  autoCapitalize="words"
                  autoCorrect={false}
                />


                {/* LAST NAME */}

                <TextInput
                  placeholder="Last name"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={
                    setLastName
                  }
                  style={styles.input}
                  editable={!loading}
                  autoCapitalize="words"
                  autoCorrect={false}
                />


                {/* EMAIL */}

                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={
                    setEmail
                  }
                  style={styles.input}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />


                {/* SOCIETY */}

                <TextInput
                  placeholder="Society name"
                  placeholderTextColor="#999"
                  value={societyName}
                  onChangeText={
                    setSocietyName
                  }
                  style={styles.input}
                  editable={!loading}
                  autoCapitalize="words"
                />


                {/* FLAT */}

                <TextInput
                  placeholder="Flat number"
                  placeholderTextColor="#999"
                  value={flatNumber}
                  onChangeText={
                    setFlatNumber
                  }
                  style={styles.input}
                  editable={!loading}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />


                {/* CREATE ACCOUNT */}

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
                      Creating account...
                    </Text>

                  </View>

                ) : (

                  <Button
                    mode="contained"
                    onPress={
                      completeRegistration
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
                    Create Account
                  </Button>

                )}


                {/* BACK */}

                <TouchableOpacity

                  disabled={loading}

                  onPress={() =>
                    navigation.navigate(
                      'PhoneLogin'
                    )
                  }

                  style={
                    styles.backButton
                  }

                >

                  <Text
                    style={
                      styles.backText
                    }
                  >
                    Back to login
                  </Text>

                </TouchableOpacity>


                {/* APPROVAL INFO */}

                <Text
                  style={
                    styles.securityText
                  }
                >
                  New resident accounts require
                  administrator approval.
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
      lineHeight: 20,
      marginBottom: 20,
    },

    verifiedBox: {
      width: '100%',

      backgroundColor:
        'rgba(255, 157, 0, 0.08)',

      borderWidth: 1,

      borderColor:
        'rgba(255, 157, 0, 0.25)',

      borderRadius: 12,

      padding: 12,

      marginBottom: 18,
    },

    verifiedLabel: {
      color: '#999',
      fontSize: 11,
      textAlign: 'center',
      marginBottom: 4,
    },

    verifiedPhone: {
      color: '#ffb13b',
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },

    input: {
      width: '100%',
      height: 54,

      backgroundColor:
        'rgba(255, 255, 255, 0.10)',

      color: '#fff',

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        'rgba(255, 255, 255, 0.18)',

      paddingHorizontal: 16,

      marginBottom: 14,

      fontSize: 16,
    },

    button: {
      width: '100%',
      borderRadius: 12,
      marginTop: 4,
      marginBottom: 8,
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
      marginBottom: 8,
    },

    loadingText: {
      color: '#ff9d00',
      marginLeft: 10,
      fontSize: 14,
    },

    backButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },

    backText: {
      color: '#ff9d00',
      fontSize: 13,
      fontWeight: '600',
    },

    securityText: {
      color: '#777',
      textAlign: 'center',
      fontSize: 11,
      marginTop: 8,
    },

  });


export default RegisterDetailsScreen;