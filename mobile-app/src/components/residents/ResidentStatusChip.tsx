// src/components/residents/ResidentStatusChip.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { ResidentStatus } from '../../types/resident';

interface ResidentStatusChipProps {
  status?: ResidentStatus;
}

const ResidentStatusChip: React.FC<ResidentStatusChipProps> = ({ status = 'inactive' }) => {
  const theme = useTheme();
  const isActive = status.toLowerCase() === 'active';
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: isActive ? theme.colors.success : theme.colors.error },
      ]}
    >
      <Text style={styles.label}>{isActive ? 'Active' : 'Inactive'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ResidentStatusChip;
