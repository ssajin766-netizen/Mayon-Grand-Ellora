import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setAuthenticated, setUser } from './store/authSlice';
import api from './services/api';
import { navigationRef } from './navigation/RootNavigation';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { PaperProvider, DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { WebViewProvider } from './context/WebViewContext';
import { ActivityIndicator, View, StyleSheet, Text, Button } from 'react-native';

import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack';

import ErrorBoundary from './components/ErrorBoundary';
import { checkAppVersion } from './services/appVersion';

// Deep linking configuration – updated to reflect new navigation structure
console.log({ AuthStack, MainStack });
const linking = {
  prefixes: ['mayon-ellora://'],
  // No specific screen mapping needed for now; all routes fall back to MainStack
  config: {
    screens: {
      MainStack: '*',
    },
  },
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [updateRequired, setUpdateRequired] = useState(false);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const dispatch = useAppDispatch();

  // Initialization: version check then session restoration
  useEffect(() => {
    const init = async () => {
      try {
        const versionInfo = await checkAppVersion();
        if (versionInfo && versionInfo.forceUpdate) {
          setUpdateRequired(true);
          return;
        }
        const resp = await api.get('/auth/me');
        if (resp.data && resp.data.user) {
          dispatch(setAuthenticated(true));
          dispatch(setUser(resp.data.user));
        }
      } catch (e) {
        // ignore errors, user will stay unauthenticated
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Placeholder for push notification registration – omitted for brevity

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (updateRequired) {
    return (
      <View style={styles.updateContainer}>
        <Text style={styles.updateTitle}>Update Required</Text>
        <Text style={styles.updateMessage}>Please update the app to continue.</Text>
        <Button title="Open Store" onPress={() => {}} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <PaperProvider theme={isAuthenticated ? PaperDarkTheme : PaperDefaultTheme}>
        <WebViewProvider>
          <NavigationContainer ref={navigationRef} theme={isAuthenticated ? DarkTheme : DefaultTheme} linking={linking}>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
          </NavigationContainer>
        </WebViewProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  updateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 20,
  },
  updateTitle: {
    color: '#ff8c00',
    fontSize: 22,
    marginBottom: 12,
  },
  updateMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default App;
