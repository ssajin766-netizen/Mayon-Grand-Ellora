// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';

export interface SearchBarProps {
  /** Current text value */
  value?: string;
  /** Called with the debounced text */
  onChangeText: (text: string) => void;
  /** Placeholder shown when empty */
  placeholder?: string;
  /** Called when the user taps the clear button */
  onClear?: () => void;
  /** Show a loading spinner (e.g., while fetching results) */
  loading?: boolean;
  /** Debounce delay in ms – defaults to 300 */
  debounce?: number;
  /** Focus the input as soon as it mounts */
  autoFocus?: boolean;
  /** Optional left icon component */
  leftIcon?: React.ReactNode;
  /** Optional right icon component (shown when not loading/clear) */
  rightIcon?: React.ReactNode;
  /** Container style overrides */
  style?: ViewStyle | ViewStyle[];
}

/** Simple debounce hook that returns a stable callback */
const useDebouncedCallback = (
  callback: (value: string) => void,
  delay: number,
) => {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const debounced = (value: string) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      callback(value);
    }, delay);
  };
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  return debounced;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  onClear,
  loading = false,
  debounce = 300,
  autoFocus = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const { colors, radii, spacing } = useTheme();
  const [internal, setInternal] = useState(value || '');

  // Keep internal in sync when the external value changes (e.g., reset from parent)
  useEffect(() => {
    setInternal(value);
  }, [value]);

  const debouncedChange = useDebouncedCallback(onChangeText, debounce);

  const handleChange = (text: string) => {
    setInternal(text);
    debouncedChange(text);
  };

  const handleClear = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setInternal('');
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radii.md }, style]} testID="search-bar">
      {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
      <TextInput
        style={[styles.input, { color: colors.textPrimary, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={internal}
        onChangeText={handleChange}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {loading ? (
        <ActivityIndicator size="small" color={colors.textSecondary} style={styles.icon} />
      ) : internal.length > 0 ? (
        <Pressable onPress={handleClear} style={styles.icon} testID="clear-button">
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
        </Pressable>
      ) : (
        rightIcon && <View style={styles.icon}>{rightIcon}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // default padding will be applied via theme spacing
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 8,
  },
});

export default SearchBar;
