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


// ==================================================
// AUTH STACK PARAM LIST
// ==================================================

export type AuthStackParamList = {

  PhoneLogin:
    undefined;

  PhoneOtp:
    {
      phone: string;
    };

  RegisterDetails:
    {
      phone: string;

      registrationToken: string;
    };

};


// ==================================================
// STACK
// ==================================================

const Stack =
  createNativeStackNavigator<
    AuthStackParamList
  >();


// ==================================================
// AUTH NAVIGATOR
// ==================================================

export default function AuthNavigator() {

  return (

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

        component={
          PhoneLoginScreen
        }

      />


      {/* ==========================================
          PHONE OTP
      ========================================== */}

      <Stack.Screen

        name="PhoneOtp"

        component={
          PhoneOtpScreen
        }

      />


      {/* ==========================================
          NEW USER REGISTRATION
      ========================================== */}

      <Stack.Screen

        name="RegisterDetails"

        component={
          RegisterDetailsScreen
        }

      />

    </Stack.Navigator>

  );

}