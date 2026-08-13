import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useWebView } from '../context/WebViewContext';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/authSlice';
import api from '../services/api';

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { navigate, clearSession } = useWebView();
  const dispatch = useAppDispatch();

  const openPage = (path: string) => {
    // Close More screen first
    navigation.goBack();

    // Then load the website page in the persistent WebView
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/api/auth/logout');
            } catch (error) {
              console.log('Logout API error:', error);
            }

            await clearSession();

            dispatch(logout());

            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'PhoneLogin',
                },
              ],
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        More
      </Text>

      <Text style={styles.subtitle}>
        Quick access
      </Text>

      {/* HELPDESK */}
      <Pressable
        style={styles.item}
        onPress={() => openPage('/helpdesk')}
      >
        <View style={[styles.iconBox, styles.helpIcon]}>
          <MaterialCommunityIcons
            name="headset"
            size={25}
            color="#ff8c00"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>
            Helpdesk
          </Text>

          <Text style={styles.itemSubtitle}>
            Contact support and submit help requests
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color="#888"
        />
      </Pressable>

      {/* EMERGENCY */}
      <Pressable
        style={styles.item}
        onPress={() => openPage('/contacts')}
      >
        <View style={[styles.iconBox, styles.emergencyIcon]}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={25}
            color="#ff3b5c"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>
            Emergency
          </Text>

          <Text style={styles.itemSubtitle}>
            Emergency contacts and important numbers
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color="#888"
        />
      </Pressable>

      {/* PROFILE */}
      <Pressable
        style={styles.item}
        onPress={() => openPage('/profile')}
      >
        <View style={[styles.iconBox, styles.profileIcon]}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={25}
            color="#2196f3"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>
            Profile
          </Text>

          <Text style={styles.itemSubtitle}>
            View and manage your profile
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color="#888"
        />
      </Pressable>

      {/* LOGOUT */}
      <Pressable
        style={styles.item}
        onPress={handleLogout}
      >
        <View style={[styles.iconBox, styles.logoutIcon]}>
          <MaterialCommunityIcons
            name="logout"
            size={25}
            color="#ff1744"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.itemTitle, styles.logoutText]}>
            Logout
          </Text>

          <Text style={styles.itemSubtitle}>
            Sign out of your account
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color="#888"
        />
      </Pressable>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#888',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 22,
  },

  item: {
    minHeight: 86,
    backgroundColor: '#1b1b1b',
    borderRadius: 16,
    marginBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#242424',
  },

  helpIcon: {},

  emergencyIcon: {},

  profileIcon: {},

  logoutIcon: {},

  textContainer: {
    flex: 1,
    marginLeft: 15,
  },

  itemTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  itemSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },

  logoutText: {
    color: '#ff1744',
  },
});

export default MoreScreen;
