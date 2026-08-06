// src/navigation/ResidentsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ResidentListScreen from '../screens/residents/ResidentListScreen';
import ResidentDetailScreen from '../screens/residents/ResidentDetailScreen';
import ResidentFormScreen from '../screens/residents/ResidentFormScreen';

export type ResidentsStackParamList = {
  ResidentList: undefined;
  ResidentDetail: { residentId: string };
  ResidentForm: { mode: 'create' | 'edit'; residentId?: string };
};

const Stack = createNativeStackNavigator<ResidentsStackParamList>();

const ResidentsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ResidentList"
      component={ResidentListScreen}
      options={{ title: 'Residents' }}
    />
    <Stack.Screen
      name="ResidentDetail"
      component={ResidentDetailScreen}
      options={{ title: 'Resident Details' }}
    />
    <Stack.Screen
      name="ResidentForm"
      component={ResidentFormScreen}
      options={({ route }) => ({
        title: route.params?.mode === 'edit' ? 'Edit Resident' : 'Add Resident',
      })}
    />
  </Stack.Navigator>
);

export default ResidentsStack;
