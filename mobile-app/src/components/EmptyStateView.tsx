import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface EmptyStateViewProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

// Placeholder illustration – replace with generated image if desired
const illustration = require('../assets/empty_state.png');

const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title = 'No Contacts Yet',
  description = 'Add a new emergency contact to get started.',
  onRetry,
}) => {
  return (
    <View style={styles.container} testID="empty-state-view">
      <Image source={illustration} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    // Glass‑morphism effect (web only)
    // @ts-ignore – React Native ignores backdropFilter
    backdropFilter: 'blur(8px)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmptyStateView;
