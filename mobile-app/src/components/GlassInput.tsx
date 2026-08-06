// src/components/GlassInput.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { KeyboardTypeOptions, AutoCapitalize } from 'react-native';

export interface GlassInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText: (text: string) => void;
  onBlur?: (e?: any) => void;

  error?: string;
  errorMessage?: string;
  helperText?: string;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: AutoCapitalize;
  multiline?: boolean;
  numberOfLines?: number;

  editable?: boolean;
  loading?: boolean;

  style?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
}

/**
 * Reusable input component that follows the glass‑morphism design system.
 * Handles error styling, optional loading spinner, optional password visibility toggle,
 * and left/right icons.
 */
const GlassInput: React.FC<GlassInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  loading = false,
  style,
  inputStyle,
}) => {
  const { colors, radii, spacing } = useTheme();
  const [internal, setInternal] = useState(value || '');
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const togglePasswordVisibility = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.card, borderRadius: radii.md },
    style,
  ];

  const inputContainer = [
    styles.inputWrapper,
    {
      borderColor: error ? colors.error : colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
    },
  ];

  const inputTextStyle = [
    styles.text,
    { color: colors.textPrimary },
    inputStyle,
  ];

  return (
    <View style={containerStyle} testID="glass-input">
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View style={inputContainer}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, inputTextStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable && !loading}
        />
        {secureTextEntry && (
          <Pressable onPress={togglePasswordVisibility} style={styles.icon} testID="toggle-visibility">
            {/* Simple eye / eye‑off text – replace with icons as needed */}
            <Text style={{ color: colors.textSecondary }}>{showPassword ? '🙈' : '👁'}</Text>
          </Pressable>
        )}
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        {loading && (
          <ActivityIndicator size="small" color={colors.textSecondary} style={styles.icon} />
        )}
      </View>
      {(helperText || error) && (
        <Text
          style={[
            styles.helper,
            { color: error ? colors.error : colors.textSecondary },
          ]}
        >
          {errorMessage ?? error ?? helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  icon: {
    marginHorizontal: 4,
  },
  helper: {
    marginTop: 4,
    fontSize: 12,
  },
  text: {},
});

export default GlassInput;
