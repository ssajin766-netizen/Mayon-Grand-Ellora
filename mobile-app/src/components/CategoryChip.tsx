// src/components/CategoryChip.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<Props> = ({ label, selected, onPress }) => {
  const { colors, spacing, radii } = useTheme();
  return (
    <TouchableOpacity
      testID="category-chip"
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceVariant,
          borderColor: selected ? colors.primary : colors.outline,
        },
      ]}
      accessibilityLabel={`Category filter ${label}`}
    >
      <Text style={{ color: selected ? colors.onPrimary : colors.onSurfaceVariant }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
});
