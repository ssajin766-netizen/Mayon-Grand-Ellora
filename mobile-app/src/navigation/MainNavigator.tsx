// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ResidentsStack from './ResidentsStack';
import NoticeboardScreen from '../screens/NoticeboardScreen';
import BillsScreen from '../screens/BillsScreen';
import HelpdeskScreen from '../screens/HelpdeskScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import ProfileStack from '../navigation/ProfileStack';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: any;
            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Residents':
                iconName = 'people';
                break;
              case 'Noticeboard':
                iconName = 'announcement';
                break;
              case 'Bills':
                iconName = 'receipt';
                break;
              case 'Helpdesk':
                iconName = 'support-agent';
                break;
              case 'Emergency':
                iconName = 'warning';
                break;
              case 'Profile':
                iconName = 'person';
                break;
              default:
                iconName = 'circle';
            }
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ffd700',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: {
            backgroundColor: 'rgba(10,10,10,0.9)',
            borderTopWidth: 0,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Residents" component={ResidentsStack} />
        <Tab.Screen name="Noticeboard" component={NoticeboardScreen} />
        <Tab.Screen name="Bills" component={BillsScreen} />
        <Tab.Screen name="Helpdesk" component={HelpdeskScreen} />
        <Tab.Screen name="Emergency" component={EmergencyScreen} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
