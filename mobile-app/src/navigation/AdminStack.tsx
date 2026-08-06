import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminBillsScreen from '../screens/admin/AdminBillsScreen';
import CreateBillScreen from '../screens/admin/CreateBillScreen';
import EditBillScreen from '../screens/admin/EditBillScreen';
import PaymentReportsScreen from '../screens/admin/PaymentReportsScreen';
import BulkGenerateBillsScreen from '../screens/admin/BulkGenerateBillsScreen';

const Stack = createNativeStackNavigator();

const AdminStack = () => (
  <Stack.Navigator initialRouteName="AdminBills">
    <Stack.Screen name="AdminBills" component={AdminBillsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateBill" component={CreateBillScreen} options={{ title: 'Create Bill' }} />
    <Stack.Screen name="EditBill" component={EditBillScreen} options={{ title: 'Edit Bill' }} />
    <Stack.Screen name="PaymentReports" component={PaymentReportsScreen} options={{ title: 'Payment Reports' }} />
    <Stack.Screen name="BulkGenerateBills" component={BulkGenerateBillsScreen} options={{ title: 'Bulk Generate Bills' }} />
  </Stack.Navigator>
);

export default AdminStack;
