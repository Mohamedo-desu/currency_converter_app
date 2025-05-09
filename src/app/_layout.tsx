import CustomThemeProvider from "@/theme/CustomThemeProvider";
import * as Font from "expo-font";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { enableFreeze } from "react-native-screens";

// vexo(process.env.EXPO_PUBLIC_VEXO_KEY!);

// const navigationIntegration = Sentry.reactNavigationIntegration({
//   enableTimeToInitialDisplay: true,
// });

// Sentry.init(sentryConfig);
// handleExpoUpdateMetadata();

enableFreeze(true);

const InitialLayout = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      // Load fonts for web
      Font.loadAsync({
        "Okra-Bold": require("@/assets/fonts/Okra-Bold.ttf"),
        "Okra-Medium": require("@/assets/fonts/Okra-Medium.ttf"),
        "Okra-Regular": require("@/assets/fonts/Okra-Regular.ttf"),
      });
    }
  }, []);

  return (
    <CustomThemeProvider>
      <Slot />
    </CustomThemeProvider>
  );
};

const RootLayout = () => {
  // const ref = useNavigationContainerRef();

  // useEffect(() => {
  //   if (ref?.current) {
  //     navigationIntegration.registerNavigationContainer(ref);
  //   }
  //   QuickActions.setItems([
  //     {
  //       title: "Wait! Don't delete me!",
  //       subtitle: "We're here to help",
  //       icon:
  //         Platform.OS === "ios"
  //           ? "symbol:person.crop.circle.badge.questionmark"
  //           : "help_icon",
  //       id: "0",
  //       params: { href: "/help" },
  //     },
  //   ]);
  // }, [ref]);

  return <InitialLayout />;
};

// export default Sentry.wrap(RootLayout);
export default RootLayout;
