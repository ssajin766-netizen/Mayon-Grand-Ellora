import Constants from 'expo-constants';

// Helper to safely read a value from the Expo manifest's `extra` field.
const getEnvVar = (key: string, fallback?: string): string => {
  // In development `manifest` may be undefined, so guard against it.
  const extra = Constants.expoConfig?.extra ?? {};
  return extra[key] ?? fallback ?? '';
};

export const ENV = {
  // Base URL for the backend API. Replace the default with your real endpoint in app.json / app.config.js.
  API_BASE_URL: getEnvVar('API_BASE_URL', 'https://api.mayon-grand-ellora.com'),
  // Human‑readable app name.
  APP_NAME: getEnvVar('APP_NAME', 'Mayon Grand Ellora'),
  // Current environment (development | staging | production).
  ENVIRONMENT: getEnvVar('ENVIRONMENT', 'development'),
  // Add more flags here as the app grows, e.g., FEATURE_X: getEnvVar('FEATURE_X') === 'true',
};
