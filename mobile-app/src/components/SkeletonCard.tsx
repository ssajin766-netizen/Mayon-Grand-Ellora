import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Simple skeleton placeholder used while data is loading.
 * It mirrors the shape of the content it replaces.
 * Uses the app's dark‑mode background colors.
 */
const SkeletonCard = () => (
  <View style={styles.skeleton} />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    height: 180,
    marginVertical: 8,
  },
});

export default SkeletonCard;
