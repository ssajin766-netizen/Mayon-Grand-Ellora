import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GoogleLoginScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Reset navigation stack and navigate to MainStack, passing flag for Google login
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainStack' as never, params: { googleLogin: true } }],
    });
  }, [navigation]);

  // Show a short spinner while navigation occurs.
  return (
    <View style={styles.container}>
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

export default GoogleLoginScreen;
