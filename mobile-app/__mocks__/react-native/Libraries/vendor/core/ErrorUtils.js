// Mock for react-native ErrorUtils to avoid Flow import errors
module.exports = {
  // No-op implementations
  setGlobalHandler: () => {},
  getGlobalHandler: () => undefined,
  reportFatalError: () => {},
  reportSoftError: () => {}
};
