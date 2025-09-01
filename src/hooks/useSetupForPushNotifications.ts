import { Colors } from "@/constants/Colors";
import { PushTokenService } from "@/services/pushTokenService";
import { getDeviceId } from "@/utils/deviceId";
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
      console.log("🔔 Starting push notification setup...");

      // Check if we've already registered a push token
      const isAlreadyRegistered =
        await PushTokenService.isPushTokenRegistered();

      if (isAlreadyRegistered) {
        console.log("✅ Push token already registered, skipping registration");
        return;
      }

      console.log("📱 No cached token found, proceeding with registration...");

      // Set up notification channel for Android
      if (Platform.OS === "android") {
        console.log("🤖 Setting up Android notification channel...");
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: Colors.primary,
        });
      }

      // Request permissions
      console.log("🔐 Requesting notification permissions...");
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

      console.log("✅ Notification permissions granted");

      // Get project ID
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        handleRegistrationError("Project ID not found in Expo config");
        return;
      }

      console.log("📋 Project ID found, getting push token...");

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

      console.log(
        "🎫 Push token obtained:",
        pushTokenString.substring(0, 50) + "..."
      );

      // Get device ID
      const deviceId = await getDeviceId();
      console.log("📱 Device ID:", deviceId);

      // Register token with backend
      console.log("🌐 Registering token with backend...");
      const result = await PushTokenService.registerPushToken(
        pushTokenString,
        deviceId
      );

      if (result.success) {
        // Save registration status locally
        await PushTokenService.savePushTokenRegistration(
          pushTokenString,
          result.tokenId
        );

        console.log("✅ Push token registered successfully:", result.message);

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
      console.log(
        "⚠️ Push notification setup already initialized, skipping..."
      );
      return;
    }

    hasInitialized.current = true;
    console.log("🚀 Initializing push notification setup...");

    // Register for push notifications on app launch
    registerForPushNotificationsAsync();
  }, []);
};

export default useSetupForPushNotifications;
