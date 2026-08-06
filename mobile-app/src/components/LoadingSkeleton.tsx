// src/components/LoadingSkeleton.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export type SkeletonType = 'card' | 'listItem' | 'avatar' | 'dashboard' | 'paragraph';

export interface LoadingSkeletonProps {
  /** Which skeleton layout to render */
  type?: SkeletonType;
  /** How many placeholders to render */
  count?: number;
  /** Enable shimmer animation (future‑proof – currently static) */
  animated?: boolean;
  /** Additional style for the container */
  style?: ViewStyle | ViewStyle[];
}

/** Simple static skeleton placeholders. */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  animated = false,
  style,
}) => {
  const { colors, spacing, radii } = useTheme();
  const placeholderStyle = {
    backgroundColor: colors.shimmerBase,
    borderRadius: radii.sm,
  } as const;

  const renderSkeleton = (key: number) => {
    switch (type) {
      case 'avatar':
        return <View key={key} style={[styles.avatar, placeholderStyle]} />;
      case 'listItem':
        return (
          <View key={key} style={[styles.listItem, placeholderStyle]}>
            <View style={[styles.listItemLine, { width: '30%' }]} />
            <View style={[styles.listItemLine, { width: '60%' }]} />
          </View>
        );
      case 'paragraph':
        return (
          <View key={key} style={styles.paragraph}>
            <View style={[styles.paragraphLine, { width: '90%' }, placeholderStyle]} />
            <View style={[styles.paragraphLine, { width: '80%' }, placeholderStyle]} />
            <View style={[styles.paragraphLine, { width: '95%' }, placeholderStyle]} />
          </View>
        );
      case 'dashboard':
        return (
          <View key={key} style={styles.dashboard}>
            <View style={[styles.dashboardBox, placeholderStyle]} />
            <View style={[styles.dashboardBox, placeholderStyle]} />
            <View style={[styles.dashboardBox, placeholderStyle]} />
          </View>
        );
      case 'card':
      default:
        return <View key={key} style={[styles.card, placeholderStyle]} />;
    }
  };

  const items = [] as React.ReactElement[];
  for (let i = 0; i < count; i++) {
    items.push(renderSkeleton(i));
  }

  return (
    <View style={[styles.container, style]} testID="loading-skeleton">
      {items}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // spacing between skeleton items
    gap: 12,
  },
  // Card placeholder – rectangular block
  card: {
    height: 120,
    marginVertical: 4,
  },
  // List item placeholder – two lines
  listItem: {
    height: 48,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  listItemLine: {
    height: 8,
    borderRadius: 4,
    marginVertical: 2,
  },
  // Avatar placeholder – circular
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginVertical: 4,
  },
  // Paragraph placeholder – multiple lines
  paragraph: {
    marginVertical: 4,
  },
  paragraphLine: {
    height: 10,
    borderRadius: 4,
    marginVertical: 2,
  },
  // Dashboard placeholder – grid of squares
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  dashboardBox: {
    width: '48%',
    height: 80,
    borderRadius: 8,
    marginVertical: 4,
  },
});

export default LoadingSkeleton;
