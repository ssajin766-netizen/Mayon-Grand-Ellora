// src/components/GlassButton.tsx
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../theme';

export type GlassButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'success'
  | 'ghost';
export type GlassButtonSize = 'small' | 'medium' | 'large';

export interface GlassButtonProps {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** optional left icon component */
  leftIcon?: React.ReactNode;
  /** optional right icon component */
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

const variantStyles = (variant: GlassButtonVariant, colors: any) => {
  // Map each variant to background & text colors using theme values.
  switch (variant) {
    case 'primary':
      return { backgroundColor: colors.primary, textColor: colors.textPrimary };
    case 'secondary':
      return { backgroundColor: colors.accent, textColor: colors.textPrimary };
    case 'danger':
      return { backgroundColor: colors.error, textColor: colors.textPrimary };
    case 'success':
      return { backgroundColor: colors.accent, textColor: colors.textPrimary };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.primary,
        textColor: colors.primary,
      };
    case 'ghost':
      return { backgroundColor: 'transparent', textColor: colors.textPrimary };
    default:
      return { backgroundColor: colors.primary, textColor: colors.textPrimary };
  }
};

const sizeStyles = (size: GlassButtonSize) => {
  switch (size) {
    case 'small':
      return { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14 };
    case 'large':
      return { paddingVertical: 14, paddingHorizontal: 24, fontSize: 18 };
    case 'medium':
    default:
      return { paddingVertical: 10, paddingHorizontal: 20, fontSize: 16 };
  }
};

const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors, radii } = useTheme();
  const { backgroundColor, textColor, borderColor } = variantStyles(variant, colors);
  const { paddingVertical, paddingHorizontal, fontSize } = sizeStyles(size);

  const isPressable = !!onPress && !disabled && !loading;

  const containerStyle = [
    styles.base,
    {
      backgroundColor,
      borderRadius: radii.md,
      paddingVertical,
      paddingHorizontal,
      opacity: disabled ? 0.6 : 1,
      borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
      borderColor: borderColor ?? undefined,
    },
    fullWidth && { alignSelf: 'stretch' },
    style,
  ];

  const label = (
    <Text
      style={[{ color: textColor, fontSize, fontFamily: 'System' }, textStyle]}
    >
      {title}
    </Text>
  );

  const content = (
    <>
      {leftIcon}
      {loading ? (
        <ActivityIndicator size="small" color={textColor} style={{ marginHorizontal: 4 }} />
      ) : (
        label
      )}
      {rightIcon}
    </>
  );

  if (isPressable) {
    return (
      <Pressable onPress={onPress} style={containerStyle} testID="glass-button">
        {content}
      </Pressable>
    );
  }

  // Non‑pressable (disabled or loading only) – render as a View
  return (
    <Pressable disabled={true} style={containerStyle} testID="glass-button">
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassButton;
