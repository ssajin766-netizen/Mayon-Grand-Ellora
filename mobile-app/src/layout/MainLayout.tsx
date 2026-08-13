import React from 'react';
import { View, StyleSheet } from 'react-native';

import WebViewComponent from '../components/WebViewComponent';
import BottomNavigation from '../components/BottomNavigation';

const MainLayout: React.FC = () => {
  return (
    <View style={styles.container}>

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
