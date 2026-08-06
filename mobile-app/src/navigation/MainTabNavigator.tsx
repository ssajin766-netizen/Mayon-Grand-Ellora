import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ResidentsScreen from '../screens/ResidentsScreen';
import NoticeboardScreen from '../screens/NoticeboardScreen';
import BillsStack from '../navigation/BillsStack';
import HelpDeskScreen from '../screens/HelpDeskScreen';
import EmergencyStack from '../navigation/EmergencyStack';
import ProfileStack from '../navigation/ProfileStack';
import AdminStack from '../navigation/AdminStack';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName: string = 'home';
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
          case 'HelpDesk':
            iconName = 'headset-outline';
            break;
          case 'Emergency':
            iconName = 'alert-outline';
            break;
          case 'Profile':
            iconName = 'account-circle-outline';
            break;
          case 'Admin':
            iconName = 'shield-outline';
            break;
        }
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ff8c00',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: { backgroundColor: '#111', borderTopWidth: 0 },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Residents" component={ResidentsScreen} />
    <Tab.Screen name="Noticeboard" component={NoticeboardScreen} />
    <Tab.Screen name="Bills" component={BillsStack} />
    <Tab.Screen name="HelpDesk" component={HelpDeskScreen} />
    <Tab.Screen name="Emergency" component={EmergencyStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
    <Tab.Screen name="Admin" component={AdminStack} />
  </Tab.Navigator>
);

export default MainTabNavigator;
