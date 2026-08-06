module.exports = {
  preset: 'react-native',
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-reanimated$': '<rootDir>/node_modules/react-native-reanimated/mock',
    '^@react-native/js-polyfills$': '<rootDir>/__mocks__/jsPolyfillsMock.js',
    '^@react-native/js-polyfills/.*$': '<rootDir>/__mocks__/jsPolyfillsMock.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(immer|react-native|@react-native|@react-navigation|expo|@expo|react-native-reanimated|expo-secure-store|expo-modules-core|expo-constants|react-redux)/)'
  ]
};

