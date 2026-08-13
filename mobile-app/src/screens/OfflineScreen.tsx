import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface OfflineScreenProps {
  onRetry: () => void;
}

const OfflineScreen: React.FC<OfflineScreenProps> = ({ onRetry }) => (
  <View style={styles.container}>
    <MaterialCommunityIcons name="wifi-off" size={80} color="#555" />
    <Text style={styles.title}>No Internet Connection</Text>
    <Text style={styles.message}>Please check your connection and try again.</Text>
    <TouchableOpacity style={styles.button} onPress={onRetry}>
      <Text style={styles.buttonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OfflineScreen;
