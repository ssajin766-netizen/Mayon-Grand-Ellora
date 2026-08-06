// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen';
import PhoneOtpScreen from '../screens/auth/PhoneOtpScreen';
import GoogleLoginScreen from '../screens/auth/GoogleLoginScreen';

export type AuthStackParamList = {
  PhoneLogin: undefined;
  PhoneOtp: { phone: string };
  GoogleLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
      <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} />
    </Stack.Navigator>
  );
}
