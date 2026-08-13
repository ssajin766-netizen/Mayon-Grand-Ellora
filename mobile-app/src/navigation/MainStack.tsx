import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainLayout from '../layout/MainLayout';
// BillsStack removed as Bills are now handled via WebView
import MoreScreen from '../screens/MoreScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainLayout" component={MainLayout} />
      <Stack.Screen name="More" component={MoreScreen} />
    </Stack.Navigator>
  );
}
