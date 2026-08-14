import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import PhoneLoginScreen
  from '../screens/auth/PhoneLoginScreen';

import PhoneOtpScreen
  from '../screens/auth/PhoneOtpScreen';

import RegisterDetailsScreen
  from '../screens/auth/RegisterDetailsScreen';

import {
  AuthStackParamList,
} from './AuthNavigator';


// ==================================================
// STACK
// ==================================================

const Stack =
  createNativeStackNavigator<
    AuthStackParamList
  >();


// ==================================================
// AUTH STACK
// ==================================================

const AuthStack = () => (

  <Stack.Navigator

    initialRouteName="PhoneLogin"

    screenOptions={{
      headerShown: false,
    }}

  >

    {/* ==========================================
        PHONE LOGIN
    ========================================== */}

    <Stack.Screen
      name="PhoneLogin"
      component={PhoneLoginScreen}
    />


    {/* ==========================================
        PHONE OTP
    ========================================== */}

    <Stack.Screen
      name="PhoneOtp"
      component={PhoneOtpScreen}
    />


    {/* ==========================================
        NEW USER REGISTRATION
    ========================================== */}

    <Stack.Screen
      name="RegisterDetails"
      component={RegisterDetailsScreen}
    />

  </Stack.Navigator>

);


export default AuthStack;