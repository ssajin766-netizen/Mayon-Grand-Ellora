import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import GoogleLoginHandler from '../../components/GoogleLoginHandler';

const OAuthScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <GoogleLoginHandler googleLogin={true} />
      <ActivityIndicator size="large" color="#ff8c00" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
});

export default OAuthScreen;
