import * as Notifications from 'expo-notifications';
import * as RootNavigation from '../navigation/RootNavigation';
import { Platform } from 'react-native';

/**
 * Sets up a listener for when the user taps on a push notification.
 * It extracts the `path` field from the notification payload and navigates
 * to the WebDashboard screen, resetting the navigation stack so the back
 * button does not return to a stale login screen.
 */
export const setupNotificationHandler = () => {
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data as any;
    const path = data?.path as string | undefined;
    if (path && RootNavigation.navigationRef.isReady()) {
      // Navigate to More screen and let it handle opening the web path via WebViewContext
      RootNavigation.navigationRef.navigate('More', { initialPath: path });
    }
  });
};
