import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWebView } from '../context/WebViewContext';
import { ROUTES } from '../config/routes';

const BottomNavigation: React.FC = () => {
  const navigation = useNavigation<any>();
  const { navigate } = useWebView();

  const tabs = [
    { name: 'Home', icon: 'home-outline', action: () => navigate(ROUTES.HOME) },
    { name: 'Residents', icon: 'account-group-outline', action: () => navigate(ROUTES.RESIDENTS) },
    { name: 'Noticeboard', icon: 'bullhorn-outline', action: () => navigate(ROUTES.NOTICEBOARD) },
    { name: 'Bills', icon: 'clipboard-pulse-outline', action: () => navigate('/bill') },
    { name: 'More', icon: 'menu', action: () => navigation.navigate('More') },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <Pressable key={tab.name} style={styles.tab} onPress={tab.action}>
          <MaterialCommunityIcons name={tab.icon as any} size={24} color="#fff" />
          <Text style={styles.label}>{tab.name}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#111',
    borderTopWidth: 0,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  label: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
  },
});

export default BottomNavigation;
