import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BillsScreen from '../screens/BillsScreen';
import BillDetailScreen from '../screens/BillDetailScreen';
import AdminBillsScreen from '../screens/admin/AdminBillsScreen';
import CreateBillScreen from '../screens/admin/CreateBillScreen';
import EditBillScreen from '../screens/admin/EditBillScreen';

const Stack = createNativeStackNavigator();

const BillsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="BillsList" component={BillsScreen} options={{ title: 'Bills' }} />
    <Stack.Screen name="BillDetail" component={BillDetailScreen} options={{ title: 'Bill Details' }} />
    {/* Admin Screens */}
    <Stack.Screen name="AdminBills" component={AdminBillsScreen} options={{ title: 'Manage Bills' }} />
    <Stack.Screen name="CreateBill" component={CreateBillScreen} options={{ title: 'Create Bill' }} />
    <Stack.Screen name="EditBill" component={EditBillScreen} options={{ title: 'Edit Bill' }} />
  </Stack.Navigator>
);

export default BillsStack;
