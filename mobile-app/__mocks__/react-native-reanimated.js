// Mock for react-native-reanimated to avoid native module errors in tests
module.exports = {
  default: {
    Value: jest.fn(() => 0),
    add: jest.fn(),
    cond: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    call: jest.fn(),
    interpolate: jest.fn(),
    timing: jest.fn(() => ({ start: jest.fn() })),
    decay: jest.fn(),
    spring: jest.fn(),
    useSharedValue: jest.fn(() => 0),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn(),
    withSpring: jest.fn(),
    withDecay: jest.fn(),
    Animated: {
      View: 'View',
    },
    Layout: {
      LinearTransition: jest.fn(),
    },
  },
  __esModule: true,
};
