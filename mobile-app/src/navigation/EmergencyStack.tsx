// src/navigation/EmergencyStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmergencyScreen from '../screens/EmergencyScreen';
import ContactDetailScreen from '../screens/ContactDetailScreen';
import AddContactScreen from '../screens/AddContactScreen';
import EditContactScreen from '../screens/EditContactScreen';

const Stack = createNativeStackNavigator();

const EmergencyStack = () => (
  <Stack.Navigator
    initialRouteName="EmergencyList"
    screenOptions={{ headerShown: false, presentation: 'modal' }}
  >
    <Stack.Screen name="EmergencyList" component={EmergencyScreen} />
    <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
    <Stack.Screen name="AddContact" component={AddContactScreen} />
    <Stack.Screen name="EditContact" component={EditContactScreen} />
  </Stack.Navigator>
);

export default EmergencyStack;
