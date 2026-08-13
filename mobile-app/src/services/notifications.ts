import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import api from "./api";

export async function registerPushNotifications() {
  // Ensure running on a physical device
  if (!Device.isDevice) return;

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  // Get Expo push token
  const { data: expoToken } = await Notifications.getExpoPushTokenAsync();

  // Send token to backend
  await api.post("/auth/push-token", {
    expoToken,
    platform: Platform.OS,
  });

  return expoToken;
}

// Configure notification handling in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
