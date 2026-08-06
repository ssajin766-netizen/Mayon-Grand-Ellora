import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

const HomeScreen = () => (
  <View style={styles.container}>
    <Card style={styles.card}>
      <Text style={styles.title}>Home Dashboard</Text>
      <Text>Welcome to Mayon Grand Ellora mobile app. This is the home dashboard placeholder.</Text>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  card: { width: '90%', padding: 20, backgroundColor: '#1e1e1e', elevation: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#ff8c00' },
});

export default HomeScreen;
