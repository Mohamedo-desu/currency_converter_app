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

Sentry.init(sentryConfig);
handleExpoUpdateMetadata();

export const unstable_settings = {
  initialRouteName: "index",
};

vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const RootLayout = () => {
  const ref = useNavigationContainerRef();

  useSetupForPushNotifications();

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="settings"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="history"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="help"
            options={{
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(RootLayout);
