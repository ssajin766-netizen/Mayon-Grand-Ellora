import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DownloadProgressProps {
  visible: boolean;
  progress: number; // 0 to 1
  onCancel?: () => void;
}

const DownloadProgressScreen: React.FC<DownloadProgressProps> = ({ visible, progress, onCancel }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="download" size={60} color="#0066ff" />
        <Text style={styles.title}>Downloading…</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
        {onCancel && (
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    color: '#333',
  },
  barBackground: {
    height: 12,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#0066ff',
  },
  percentage: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#b00020',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DownloadProgressScreen;
