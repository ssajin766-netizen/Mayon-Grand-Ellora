import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { COLORS } from './src/theme/colors';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import HomeScreen from './src/screens/HomeScreen';
import NoticesScreen from './src/screens/NoticesScreen';
import BillsScreen from './src/screens/BillsScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Unauthenticated Screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OtpVerification" component={OtpScreen} />
          </>
        ) : (
          // Authenticated Screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Notices" component={NoticesScreen} />
            <Stack.Screen name="Bills" component={BillsScreen} />
            <Stack.Screen name="Complaints" component={ComplaintsScreen} />
            <Stack.Screen name="Contacts" component={ContactsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%' }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
