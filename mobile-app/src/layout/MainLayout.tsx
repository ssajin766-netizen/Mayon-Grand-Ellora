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

      {/* Website occupies the complete screen */}
      <WebViewComponent />

      {/* Native bottom navigation overlays the WebView */}
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

  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

});

export default MainLayout;