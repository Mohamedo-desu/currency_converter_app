import ToastConfig from "@/components/toast/ToastConfig";
import useUpdates from "@/hooks/useUpdates";
import CustomThemeProvider from "@/theme/CustomThemeProvider";
import * as Sentry from "@sentry/react-native";
import * as QuickActions from "expo-quick-actions";
import { Slot, useNavigationContainerRef } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { vexo } from "vexo-analytics";

const manifest = Updates.manifest;
const metadata = "metadata" in manifest ? manifest.metadata : undefined;
const extra = "extra" in manifest ? manifest.extra : undefined;
const updateGroup =
  metadata && "updateGroup" in metadata ? metadata.updateGroup : undefined;

vexo(process.env.EXPO_PUBLIC_VEXO_KEY!);

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
    Sentry.spotlightIntegration(),
    navigationIntegration,
  ],
  _experiments: {
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  },
  debug: false,
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  attachStacktrace: true,
  enableAutoPerformanceTracing: true,
});

const scope = Sentry.getGlobalScope();

scope.setTag("expo-update-id", Updates.updateId);
scope.setTag("expo-is-embedded-update", Updates.isEmbeddedLaunch);

if (typeof updateGroup === "string") {
  scope.setTag("expo-update-group-id", updateGroup);

  const owner = extra?.expoClient?.owner ?? "[account]";
  const slug = extra?.expoClient?.slug ?? "[project]";
  scope.setTag(
    "expo-update-debug-url",
    `https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`
  );
} else if (Updates.isEmbeddedLaunch) {
  // This will be `true` if the update is the one embedded in the build, and not one downloaded from the updates server.
  scope.setTag("expo-update-debug-url", "not applicable for embedded updates");
}

const InitialLayout = () => {
  return (
    <CustomThemeProvider>
      <Slot />
    </CustomThemeProvider>
  );
};

const RootLayout = () => {
  useUpdates();

  const ref = useNavigationContainerRef();
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
    QuickActions.setItems([
      {
        title: "Wait! Don't delete me!",
        subtitle: "We're here to help",
        icon:
          Platform.OS === "ios"
            ? "symbol:person.crop.circle.badge.questionmark"
            : "help_icon",
        id: "0",
        params: { href: "/help" },
      },
    ]);
  }, [ref]);

  return (
    <>
      <KeyboardProvider>
        <InitialLayout />
      </KeyboardProvider>

      <Toast config={ToastConfig} position="top" topOffset={top + 15} />
    </>
  );
};

export default Sentry.wrap(RootLayout);
