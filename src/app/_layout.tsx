import CustomThemeProvider from "@/theme/CustomThemeProvider";
import { handleExpoUpdateMetadata } from "@/utils/expoUpdateMetadata";
import * as Sentry from "@sentry/react-native";
import * as QuickActions from "expo-quick-actions";
import { Slot, useNavigationContainerRef } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableFreeze } from "react-native-screens";
import sentryConfig from "sentry.config";
import { vexo } from "vexo-analytics";

vexo(process.env.EXPO_PUBLIC_VEXO_KEY!);

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init(sentryConfig);
handleExpoUpdateMetadata();

enableFreeze(true);

const InitialLayout = () => {
  return (
    <CustomThemeProvider>
      <Slot />
    </CustomThemeProvider>
  );
};

const RootLayout = () => {
  const ref = useNavigationContainerRef();

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InitialLayout />
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(RootLayout);
