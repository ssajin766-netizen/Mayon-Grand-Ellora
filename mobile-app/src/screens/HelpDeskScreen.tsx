import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HelpDeskScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help Desk</Text>
      <Text style={styles.body}>This is a placeholder Help Desk screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default HelpDeskScreen;
