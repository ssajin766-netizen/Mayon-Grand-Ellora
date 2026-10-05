import React from 'react';
import { View, StyleSheet } from 'react-native';

import WebViewComponent from '../components/WebViewComponent';
import BottomNavigation from '../components/BottomNavigation';
import MobileSessionRestore from '../components/MobileSessionRestore';

const MainLayout: React.FC = () => {
  return (
    <View style={styles.container}>

      {/*
       * Restore the server-side Passport session before the
       * WebView is used for protected pages.
       *
       * This component must NOT render a second WebView.
       * It only coordinates the one-time mobile session
       * restore ticket with WebViewContext/WebViewComponent.
       */}
      <MobileSessionRestore />

      {/*
       * WebView takes the available space above the
       * native bottom navigation.
       *
       * Because the navigation is no longer absolute,
       * WebView content will not be hidden underneath it.
       */}
      <View style={styles.webViewContainer}>
        <WebViewComponent />
      </View>

      {/*
       * Native bottom navigation is now part of the normal
       * layout instead of overlaying the WebView.
       */}
      <View style={styles.bottomNavigation}>
        <BottomNavigation />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  webViewContainer: {
    flex: 1,
  },

  bottomNavigation: {
    width: '100%',
    backgroundColor: '#000',
  },

});

export default MainLayout;