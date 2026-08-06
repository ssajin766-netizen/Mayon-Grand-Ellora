// src/components/QuickActionButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface Props {
  type: 'call' | 'email' | 'maps';
  onPress: () => void;
}

export const QuickActionButton: React.FC<Props> = ({ type, onPress }) => {
  const { colors } = useTheme();
  const iconName = {
    call: 'phone-outline',
    email: 'email-outline',
    maps: 'map-marker-outline',
  }[type];

  return (
    <TouchableOpacity onPress={onPress} style={styles.button} accessibilityLabel={`${type} action`} testID={`quick-action-${type}`} accessibilityRole="button">
      <MaterialCommunityIcons name={iconName as string} size={24} color={colors.onSurface} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 6,
  },
});
