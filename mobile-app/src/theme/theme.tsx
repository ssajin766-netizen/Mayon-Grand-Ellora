import React from 'react';
import { Platform, ColorSchemeName, useColorScheme } from 'react-native';

// Dark mode color palette
const colors = {
  background: '#121212',
  surface: '#1e1e1e',
  card: 'rgba(255,255,255,0.08)',
  cardLight: '#ffffff',
  primary: '#bb86fc',
  accent: '#03dac6',
  textPrimary: '#ffffff',
  textSecondary: '#b0b0b0',
  textPrimaryLight: '#000000',
  textSecondaryLight: '#666666',
  error: '#cf6679',
  success: '#22C55E',
  surfaceVariant: '#F3F4F6',
  onSurfaceVariant: '#6B7280',
  shimmerBase: '#2a2a2a',
  shimmerHighlight: '#3a3a3a',
};

type FontWeight = '400' | '500' | '600' | '700';

const typography = {
  fontFamily: Platform.select({ ios: 'Inter', android: 'Inter', default: 'Inter' }),
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as FontWeight },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: '600' as FontWeight },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as FontWeight },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as FontWeight },
  button: { fontSize: 15, lineHeight: 22, fontWeight: '500' as FontWeight },
};

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const radii = { sm: 8, md: 12, lg: 16 };
const elevation = { sm: 2, md: 4, lg: 8 };

export const useTheme = () => {
  const scheme: ColorSchemeName = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: {
      background: isDark ? colors.background : '#f5f5f5',
      surface: isDark ? colors.surface : '#ffffff',
      card: isDark ? colors.card : colors.cardLight,
      primary: colors.primary,
      accent: colors.accent,
      textPrimary: isDark ? colors.textPrimary : colors.textPrimaryLight,
      textSecondary: isDark ? colors.textSecondary : colors.textSecondaryLight,
      error: colors.error,
      success: colors.success,
      surfaceVariant: colors.surfaceVariant,
      onSurfaceVariant: colors.onSurfaceVariant,
      shimmerBase: isDark ? colors.shimmerBase : '#e0e0e0',
      shimmerHighlight: isDark ? colors.shimmerHighlight : '#f0f0f0',
    },
    typography,
    spacing,
    radii,
    elevation,
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
