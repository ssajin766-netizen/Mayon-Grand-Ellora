import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import api from '../../services/api';
import { Button } from 'react-native-paper';
import { useAppDispatch } from '../../store/hooks';
import { setAuthenticated, setUser } from '../../store/authSlice';

const GoogleLoginScreen = () => {
  const dispatch = useAppDispatch();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      (async () => {
        try {
          const r = await api.post('/auth/google', { accessToken: authentication?.accessToken });
          });
          if (r.data.success) {
            dispatch(setAuthenticated(true));
            if (r.data.user) {
              dispatch(setUser(r.data.user));
            }
          } else {
            alert('Google sign‑in failed');
          }
        } catch (e) {
          alert('Network error');
        }
      })();
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in with Google</Text>
      {request ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button mode="contained" onPress={() => promptAsync()} style={styles.button}>Continue with Google</Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  title: { color: '#ff8c00', marginBottom: 20 },
  button: { width: '80%' },
});

export default GoogleLoginScreen;
