// src/components/residents/ResidentAvatar.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme';

interface ResidentAvatarProps {
  name: string;
  image?: ImageSourcePropType;
  size?: number;
}

const ResidentAvatar: React.FC<ResidentAvatarProps> = ({ name, image, size = 48 }) => {
  const theme = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();

  return image ? (
    <Image source={image} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
  ) : (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surfaceVariant,
        },
      ]}
    >
      <Text style={[styles.initials, { color: theme.colors.onSurfaceVariant }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResidentAvatar;
