import { Colors } from "@/constants/Colors";
import { PushTokenService } from "@/services/pushTokenService";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

function handleRegistrationError(errorMessage: string) {
  console.error("Push notification registration error:", errorMessage);
}

const useSetupForPushNotifications = () => {
  const hasInitialized = useRef(false);

  async function registerForPushNotificationsAsync() {
    try {
      // Check if we've already registered a push token
      const isAlreadyRegistered =
        await PushTokenService.isPushTokenRegistered();

      if (isAlreadyRegistered) {
        return;
      }

      // Set up notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: Colors.primary,
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }

      // Get project ID
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        handleRegistrationError("Project ID not found in Expo config");
        return;
      }

      // Get push token
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (!pushTokenString) {
        handleRegistrationError("Failed to get push token from Expo");
        return;
      }

      // Register token with backend

      const result = await PushTokenService.registerPushToken(pushTokenString);

      if (result.success) {
        // Save registration status locally
        await PushTokenService.savePushTokenRegistration(
          pushTokenString,
          result.tokenId
        );

        if (result.alreadyExists) {
          console.log("ℹ️ Token was already registered on backend");
        }
      } else {
        handleRegistrationError(
          `Failed to register push token: ${result.message}`
        );
      }
    } catch (error: unknown) {
      handleRegistrationError(`Push token registration failed: ${error}`);
    }
  }

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    // Register for push notifications on app launch
    registerForPushNotificationsAsync();
  }, []);
};

export default useSetupForPushNotifications;
