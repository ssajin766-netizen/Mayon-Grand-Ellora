// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen';
import PhoneOtpScreen from '../screens/auth/PhoneOtpScreen';

export type AuthStackParamList = {
  PhoneLogin: undefined;
  PhoneOtp: { phone: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
    </Stack.Navigator>
  );
}
