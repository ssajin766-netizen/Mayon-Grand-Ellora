import { DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';

export const DefaultTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#ff8c00',
    background: '#111111',
    surface: '#1e1e1e',
    text: '#ffffff',
    placeholder: '#888888',
  },
  roundness: 8,
};

export const DarkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#ff8c00',
    background: '#000000',
    surface: '#121212',
    text: '#ffffff',
    placeholder: '#bbbbbb',
  },
  roundness: 8,
};
