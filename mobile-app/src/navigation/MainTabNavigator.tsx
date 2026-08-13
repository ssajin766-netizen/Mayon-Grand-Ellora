import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWebView } from '../context/WebViewContext';

import BillsStack from './BillsStack';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { navigate } = useWebView();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'circle-outline';

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Residents':
              iconName = 'account-group-outline';
              break;
            case 'Noticeboard':
              iconName = 'bullhorn-outline';
              break;
            case 'Bills':
              iconName = 'clipboard-pulse-outline';
              break;
            case 'More':
              iconName = 'menu';
              break;
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },

        tabBarActiveTintColor: '#ff8c00',
        tabBarInactiveTintColor: '#888',

        tabBarStyle: {
          backgroundColor: '#111',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        listeners={{
          tabPress: () => {
            navigate('/home');
          },
        }}
      />

      <Tab.Screen
        name="Residents"
        component={ResidentsTab}
        listeners={{
          tabPress: () => {
            navigate('/residents');
          },
        }}
      />

      <Tab.Screen
        name="Noticeboard"
        component={NoticeboardTab}
        listeners={{
          tabPress: () => {
            navigate('/noticeboard');
          },
        }}
      />

      {/* Native Bills + Razorpay */}
      <Tab.Screen name="Bills" component={BillsStack} />

      {/* More menu */}
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

const HomeTab = () => null;
const ResidentsTab = () => null;
const NoticeboardTab = () => null;

export default MainTabNavigator;
