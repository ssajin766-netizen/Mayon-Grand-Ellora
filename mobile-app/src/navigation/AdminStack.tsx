import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import AdminBillsScreen from '../screens/admin/AdminBillsScreen';
import CreateBillScreen from '../screens/admin/CreateBillScreen';
import EditBillScreen from '../screens/admin/EditBillScreen';
import PaymentReportsScreen from '../screens/admin/PaymentReportsScreen';
import BulkGenerateBillsScreen from '../screens/admin/BulkGenerateBillsScreen';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      initialRouteName="AdminBills"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#111' },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              dispatch(logout());
              // Assuming a 'Login' screen exists in auth flow
              navigation.navigate('Login' as any);
            }}
            style={{ marginRight: 10 }}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="AdminBills" component={AdminBillsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateBill" component={CreateBillScreen} options={{ title: 'Create Bill' }} />
      <Stack.Screen name="EditBill" component={EditBillScreen} options={{ title: 'Edit Bill' }} />
      <Stack.Screen name="PaymentReports" component={PaymentReportsScreen} options={{ title: 'Payment Reports' }} />
      <Stack.Screen name="BulkGenerateBills" component={BulkGenerateBillsScreen} options={{ title: 'Bulk Generate Bills' }} />
    </Stack.Navigator>
  );
};

export default AdminStack;
