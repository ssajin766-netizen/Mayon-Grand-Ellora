// Mock for react-native's ErrorUtils module to satisfy Jest tests
module.exports = {
  setGlobalHandler: () => {},
  getGlobalHandler: () => undefined,
  reportFatalError: () => {},
  reportSoftError: () => {}
};
