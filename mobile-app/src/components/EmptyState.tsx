// src/components/EmptyState.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';
import GlassButton from './GlassButton';

export interface EmptyStateProps {
  /** Optional icon component (e.g., a vector icon) */
  icon?: React.ReactNode;
  /** Optional illustration image */
  image?: ImageSourcePropType;

  /** Main title – required */
  title: string;
  /** Optional description text */
  description?: string;

  /** Optional action button title */
  actionTitle?: string;
  /** Callback for the action button */
  onAction?: () => void;

  /** Style overrides for the outer container */
  style?: ViewStyle | ViewStyle[];
  /** Optional style overrides for the title text */
  titleStyle?: TextStyle | TextStyle[];
  /** Optional style overrides for the description text */
  descriptionStyle?: TextStyle | TextStyle[];
}

/**
 * Generic empty‑state component used across the app.
 * It displays an optional icon or illustration, a title, description, and
 * an optional primary action button.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  image,
  title,
  description,
  actionTitle,
  onAction,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  const { colors, spacing, radii } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.md }, style]} testID="empty-state">
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      {image && <Image source={image} style={styles.image} resizeMode="contain" />}
      <Text style={[styles.title, { color: colors.textPrimary }, titleStyle]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }, descriptionStyle]}>{description}</Text>
      )}
      {actionTitle && onAction && (
        <GlassButton
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButton: {
    // Button already has its own padding; we only add spacing here.
    marginTop: 8,
  },
});

export default EmptyState;
