import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';

const NoticeboardScreen = () => (
  <View style={styles.container}>
    <Card style={styles.card}>
      <Text style={styles.title}>Notice Board</Text>
      <Text>Admin can view, create, edit, delete notices here.</Text>
      <Button mode="contained" style={styles.button}>Create Notice</Button>
    </Card>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  card: { width: '90%', padding: 20, backgroundColor: '#1e1e1e', elevation: 8 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#ff8c00' },
  button: { marginTop: 12 },
});

export default NoticeboardScreen;
