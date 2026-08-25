import React, {
  useEffect,
  useState,
} from 'react';

import {
  useAppDispatch,
  useAppSelector,
} from './store/hooks';

import {
  setAuthenticated,
  setUser,
} from './store/authSlice';

import {
  navigationRef,
} from './navigation/RootNavigation';

import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import {
  PaperProvider,
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
} from 'react-native-paper';

import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  Button,
} from 'react-native';

import {
  WebViewProvider,
} from './context/WebViewContext';

import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack';

import ErrorBoundary from './components/ErrorBoundary';

import {
  checkAppVersion,
} from './services/appVersion';

import {
  getPersistedAuth,
  clearAuthState,
} from './services/authPersistence';

import {
  getMobileAuthToken,
  clearMobileAuthToken,
} from './services/mobileAuthToken';


// ==========================================================
// DEEP LINKING
// ==========================================================

const linking = {
  prefixes: [
    'mayon-ellora://',
    'com.mayongrandellora.app://',
  ],

  config: {
    screens: {
      MainStack: '*',
    },
  },
};


// ==========================================================
// APP
// ==========================================================

const App = () => {

  const dispatch = useAppDispatch();

  const isAuthenticated =
    useAppSelector(
      state =>
        state.auth.isAuthenticated
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [updateRequired, setUpdateRequired] =
    useState(false);


  // ========================================================
  // INITIALIZATION
  // ========================================================

  useEffect(() => {

    let mounted = true;

    const initializeApp = async () => {

      console.log(
        '========================================'
      );

      console.log(
        'APP INITIALIZATION'
      );

      console.log(
        '========================================'
      );


      try {

        // ==================================================
        // 1. CHECK APP VERSION
        // ==================================================

        console.log(
          'CHECKING APP VERSION...'
        );

        const versionInfo =
          await checkAppVersion();


        console.log(
          'APP VERSION RESULT:',
          versionInfo
        );


        if (
          versionInfo?.forceUpdate === true
        ) {

          console.log(
            'APP UPDATE REQUIRED'
          );


          if (mounted) {

            setUpdateRequired(
              true
            );

          }


          return;

        }


        // ==================================================
        // 2. RESTORE PERSISTED LOGIN
        // ==================================================

        console.log(
          '========================================'
        );

        console.log(
          'RESTORING PERSISTED AUTH STATE...'
        );

        console.log(
          '========================================'
        );


        const persistedAuth =
          await getPersistedAuth();


        console.log(
          'PERSISTED AUTH CHECK:',
          {
            authenticated:
              persistedAuth.authenticated,

            hasUser:
              !!persistedAuth.user,
          }
        );


        // ==================================================
        // 3. CHECK PERSISTENT MOBILE AUTH TOKEN
        // ==================================================

        let mobileAuthToken:
          string | null = null;


        if (
          persistedAuth.authenticated &&
          persistedAuth.user
        ) {

          mobileAuthToken =
            await getMobileAuthToken();


          console.log(
            'MOBILE AUTH TOKEN AVAILABLE:',
            !!mobileAuthToken
          );

        }


        // ==================================================
        // 4. VALID PERSISTED LOGIN
        // ==================================================

        if (
          persistedAuth.authenticated &&
          persistedAuth.user &&
          mobileAuthToken
        ) {

          console.log(
            '========================================'
          );

          console.log(
            'PERSISTED LOGIN FOUND'
          );

          console.log(
            'USER:',
            persistedAuth.user
          );

          console.log(
            'MOBILE AUTH TOKEN:',
            'AVAILABLE'
          );

          console.log(
            'OPENING MAIN STACK'
          );

          console.log(
            'WEBVIEW SESSION WILL BE RESTORED'
          );

          console.log(
            '========================================'
          );


          if (!mounted) {
            return;
          }


          /*
          --------------------------------------------------
          Restore native authentication state.

          MainStack will mount.

          MobileSessionRestore will then:
          1. Read SecureStore
          2. Request a short-lived restore ticket
          3. Give the ticket to WebViewComponent
          4. WebView creates a fresh Passport session
          --------------------------------------------------
          */

          dispatch(
            setUser(
              persistedAuth.user
            )
          );


          dispatch(
            setAuthenticated(
              true
            )
          );


          return;

        }


        // ==================================================
        // 5. CORRUPTED / INCOMPLETE PERSISTED LOGIN
        // ==================================================

        if (
          persistedAuth.authenticated &&
          persistedAuth.user &&
          !mobileAuthToken
        ) {

          console.log(
            '========================================'
          );

          console.log(
            'PERSISTED LOGIN FOUND'
          );

          console.log(
            'BUT MOBILE AUTH TOKEN IS MISSING'
          );

          console.log(
            'CLEARING INVALID PERSISTED AUTH'
          );

          console.log(
            '========================================'
          );


          await clearMobileAuthToken();

          await clearAuthState();


          if (!mounted) {
            return;
          }


          dispatch(
            setUser(null)
          );


          dispatch(
            setAuthenticated(false)
          );


          return;

        }


        // ==================================================
        // 6. NO LOGIN
        // ==================================================

        console.log(
          '========================================'
        );

        console.log(
          'NO PERSISTED LOGIN'
        );

        console.log(
          'OPENING AUTH STACK'
        );

        console.log(
          '========================================'
        );


        if (!mounted) {
          return;
        }


        dispatch(
          setUser(null)
        );


        dispatch(
          setAuthenticated(false)
        );


      }

      catch (error) {

        console.error(
          'APP INITIALIZATION ERROR:',
          error
        );


        if (!mounted) {
          return;
        }


        /*
        --------------------------------------------------
        IMPORTANT

        If initialization itself fails, don't leave a
        potentially corrupted authenticated state.
        --------------------------------------------------
        */

        dispatch(
          setUser(null)
        );


        dispatch(
          setAuthenticated(false)
        );

      }

      finally {

        if (mounted) {

          setIsLoading(false);

        }

      }

    };


    initializeApp();


    return () => {

      mounted = false;

    };

  }, [dispatch]);


  // ========================================================
  // LOADING SCREEN
  // ========================================================

  if (isLoading) {

    return (

      <View
        style={styles.loader}
      >

        <ActivityIndicator
          size="large"
        />

        <Text
          style={styles.loadingText}
        >
          Loading...
        </Text>

      </View>

    );

  }


  // ========================================================
  // UPDATE REQUIRED
  // ========================================================

  if (updateRequired) {

    return (

      <View
        style={styles.updateContainer}
      >

        <Text
          style={styles.updateTitle}
        >
          Update Required
        </Text>


        <Text
          style={styles.updateMessage}
        >
          Please update the app to continue.
        </Text>


        <Button
          title="Open Store"
          onPress={() => {}}
        />

      </View>

    );

  }


  // ========================================================
  // MAIN APP
  // ========================================================

  return (

    <ErrorBoundary>

      <PaperProvider
        theme={
          isAuthenticated
            ? PaperDarkTheme
            : PaperDefaultTheme
        }
      >

        <WebViewProvider>

          <NavigationContainer
            ref={navigationRef}

            theme={
              isAuthenticated
                ? DarkTheme
                : DefaultTheme
            }

            linking={linking}
          >

            {isAuthenticated ? (

              <MainStack />

            ) : (

              <AuthStack />

            )}

          </NavigationContainer>

        </WebViewProvider>

      </PaperProvider>

    </ErrorBoundary>

  );

};


// ==========================================================
// STYLES
// ==========================================================

const styles = StyleSheet.create({

  loader: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#000',

  },

  loadingText: {

    color: '#fff',

    marginTop: 12,

    fontSize: 15,

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

  },

});


export default App;