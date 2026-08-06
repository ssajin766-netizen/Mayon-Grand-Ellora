// jest.setup.js - set up mocks and timers
jest.useFakeTimers();

// Mock ErrorUtils to avoid Flow import errors in React Native
jest.mock('react-native/Libraries/vendor/core/ErrorUtils', () =>
  require('./__mocks__/react-native/Libraries/vendor/core/ErrorUtils')
);

// Mock expo-secure-store for tests
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(null),
}));

// Mock expo-modules-core to avoid native module errors
jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(() => ({})),
  NativeModulesProxy: {},
}));

// Mock expo-constants for tests
jest.mock('expo-constants', () => ({
  manifest: { extra: {} },
  expoConfig: { extra: {} },
}));

// Mock theme hook for components
jest.mock('./src/theme', () => ({
  useTheme: () => ({
    colors: {
      card: '#fff',
      cardLight: '#fff',
      primary: '#6200ee',
      surfaceVariant: '#f0f0f',
      outline: '#ccc',
      onPrimary: '#fff',
      onSurfaceVariant: '#000',
      onSurface: '#000',
    },
    radii: { md: 8 },
    elevation: { md: 4 },
  }),
}));

// Mock image assets used in EmptyStateView
jest.mock('./src/assets/empty_state.png', () => 'empty_state.png');

// Mock expo-font to avoid ESM export error
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: () => null,
}));
