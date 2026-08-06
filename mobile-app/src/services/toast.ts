// src/services/toast.ts
import { Platform, ToastAndroid } from 'react-native';
// Optional flash-message import – fallback to no-op if library is not installed (test environment)
let showMessage: (options: any) => void;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ showMessage } = require('react-native-flash-message'));
} catch (_) {
  showMessage = () => {};
}


// Simple abstraction over toast / flash messages
export const showSuccess = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    showMessage({ message, type: 'success', icon: 'success', duration: 3000 });
  }
};

export const showError = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    showMessage({ message, type: 'danger', icon: 'danger', duration: 5000 });
  }
};

export const showInfo = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    showMessage({ message, type: 'info', icon: 'info', duration: 3000 });
  }
};
