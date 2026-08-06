import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { COLORS } from './src/theme/colors';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import ResidentsScreen from './src/screens/ResidentsScreen';
import NoticeboardScreen from './src/screens/NoticeboardScreen';
import CreateNoticeScreen from './src/screens/CreateNoticeScreen';
import BillScreen from './src/screens/BillScreen';
import HelpdeskScreen from './src/screens/HelpdeskScreen';
import RaiseComplaintScreen from './src/screens/RaiseComplaintScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import EditContactsScreen from './src/screens/EditContactsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';
import EditBillScreen from './src/screens/EditBillScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import LoginHistoryScreen from './src/screens/LoginHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (matches website navbar)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Residents') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Noticeboard') iconName = focused ? 'megaphone' : 'megaphone-outline';
          else if (route.name === 'Helpdesk') iconName = focused ? 'headset' : 'headset-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Residents" component={ResidentsScreen} />
      <Tab.Screen name="Noticeboard" component={NoticeboardScreen} />
      <Tab.Screen name="Helpdesk" component={HelpdeskScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

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
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OtpVerification" component={OtpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Bill" component={BillScreen} />
            <Stack.Screen name="EditBill" component={EditBillScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="LoginHistory" component={LoginHistoryScreen} />
            <Stack.Screen name="Contacts" component={ContactsScreen} />
            <Stack.Screen name="EditContacts" component={EditContactsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            <Stack.Screen name="CreateNotice" component={CreateNoticeScreen} />
            <Stack.Screen name="RaiseComplaint" component={RaiseComplaintScreen} />
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
