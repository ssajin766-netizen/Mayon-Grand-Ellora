import React from 'react';
import { Pressable, View, StyleSheet, useColorScheme, ViewStyle, GestureResponderEvent } from 'react-native';
import { useTheme } from '../theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  padding?: number; // overrides default padding
  elevation?: keyof typeof elevationValues;
};

// Simple mapping for elevation levels – can be expanded later
const elevationValues = {
  sm: 2,
  md: 4,
  lg: 8,
} as const;

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  disabled = false,
  padding = 16,
  elevation = 'md',
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { colors, radii, glass } = useTheme();
  const backgroundColor = isDark ? colors.card : colors.cardLight;

  const containerStyle = [
    styles.base,
    {
      backgroundColor,
      borderRadius: radii.md,
      padding,
      // Use the shared glass backdrop filter if supported (web only). Ignored on native.
      ...(glass && { backdropFilter: glass.backdropFilter }),
    },
    style,
  ];

  const content = <View style={containerStyle}>{children}</View>;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, containerStyle]}
        testID="glass-card"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle} testID="glass-card">
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    marginVertical: 8,
    // Default shadow – can be overridden per platform
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default GlassCard;
