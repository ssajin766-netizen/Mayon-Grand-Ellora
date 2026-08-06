import React, { useEffect, useState } from 'react';
import { useAppDispatch } from './store/hooks';
import { setAuthenticated, setUser } from './store/authSlice';

import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { PaperProvider, DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import api from './services/api';
import MainTabNavigator from './navigation/MainTabNavigator';
import AuthStack from './navigation/AuthStack';
import { useAppSelector } from './store/hooks';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const resp = await api.get('/auth/me');
        if (resp.data && resp.data.user) {
          dispatch(setAuthenticated(true));
          dispatch(setUser(resp.data.user));
        }
      } catch (e) {
        // Not authenticated or network error
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={isAuthenticated ? PaperDarkTheme : PaperDefaultTheme}>
      <NavigationContainer theme={isAuthenticated ? DarkTheme : DefaultTheme}>
        {isAuthenticated ? <MainTabNavigator /> : <AuthStack />}
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default App;
