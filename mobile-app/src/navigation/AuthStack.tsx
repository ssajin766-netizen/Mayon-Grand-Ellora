import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen';
import PhoneOtpScreen from '../screens/auth/PhoneOtpScreen';
import GoogleLoginScreen from '../screens/auth/GoogleLoginScreen';
import { AuthStackParamList } from './AuthNavigator';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
    <Stack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
    <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} />
  </Stack.Navigator>
);

export default AuthStack;
