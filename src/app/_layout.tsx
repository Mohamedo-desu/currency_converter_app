import { ThemeProvider } from "@/context/ThemeContext";
import useSetupForPushNotifications from "@/hooks/useSetupForPushNotifications";
import { handleExpoUpdateMetadata } from "@/utils/expoUpdateMetadata";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import * as Notifications from "expo-notifications";
import { Stack, useNavigationContainerRef } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze } from "react-native-screens";
import { sentryConfig } from "sentry.config";
import { vexo } from "vexo-analytics";

enableFreeze(true);

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

// Initialize Sentry
Sentry.init(sentryConfig);

// Handle OTA update metadata (for tracking builds/updates)
handleExpoUpdateMetadata();

// Initialize analytics
vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY);

// Configure foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  initialRouteName: "index",
};

const RootLayout = () => {
  const navigationRef = useNavigationContainerRef();

  // Set up push notification registration (permissions, token, listeners, etc.)
  useSetupForPushNotifications();

  // Register custom Android channel (with sound, vibration, lights, etc.)
  useEffect(() => {
    Notifications.setNotificationChannelAsync("currency-converter-updates", {
      name: "Currency Converter Updates",
      description: "Notifications for app updates and important announcements",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "update.wav",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#069140",
      enableLights: true,
      enableVibrate: true,
    });
  }, []);

  // Hook Sentry into navigation container
  useEffect(() => {
    if (navigationRef?.current) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="settings"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="history"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="help"
            options={{ animation: "slide_from_bottom" }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(RootLayout);
