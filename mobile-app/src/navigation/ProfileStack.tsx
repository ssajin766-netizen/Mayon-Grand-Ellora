import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ViewProfileScreen from '../screens/profile/ViewProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePhotoScreen from '../screens/profile/ChangePhotoScreen';
import AboutAppScreen from '../screens/profile/AboutAppScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsScreen from '../screens/profile/TermsScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator initialRouteName="ViewProfile" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ChangePhoto" component={ChangePhotoScreen} />
    <Stack.Screen name="AboutApp" component={AboutAppScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
  </Stack.Navigator>
);

export default ProfileStack;
