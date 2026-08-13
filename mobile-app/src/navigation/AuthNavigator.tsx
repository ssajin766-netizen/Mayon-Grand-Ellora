// src/navigation/AuthNavigator.tsx

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


const Stack =
  createNativeStackNavigator<AuthStackParamList>();


export default function AuthNavigator() {

  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen
        name="PhoneLogin"
        component={PhoneLoginScreen}
      />

      <Stack.Screen
        name="PhoneOtp"
        component={PhoneOtpScreen}
      />

      <Stack.Screen
        name="RegisterDetails"
        component={RegisterDetailsScreen}
      />

    </Stack.Navigator>

  );

}