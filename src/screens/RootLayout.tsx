// RootLayout.tsx
import { getStoredValues, saveSecurely } from "@/store/storage";
import CustomThemeProvider from "@/theme/CustomThemeProvider";
import { Screen } from "@/types/AuthHeader.types";
import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CurrencyConverterScreen from "./CurrencyConverterScreen";
import HelpScreen from "./help";
import HistoryScreen from "./history";
import SettingsScreen from "./settings";

export default function RootLayout() {
  // 1. Read last screen from storage (or default to Converter)
  const stored = getStoredValues(["lastScreen"]).lastScreen as Screen | null;
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    stored || "Converter"
  );

  // 2. Persist changes whenever the screen changes
  useEffect(() => {
    saveSecurely([{ key: "lastScreen", value: currentScreen }]);
  }, [currentScreen]);

  // 3. Navigation callback that simply updates state
  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // 4. Conditionally render your four screens
  const renderScreen = () => {
    switch (currentScreen) {
      case "Converter":
        return <CurrencyConverterScreen navigate={navigate} />;
      case "Settings":
        return <SettingsScreen navigate={navigate} />;
      case "History":
        return <HistoryScreen navigate={navigate} />;
      case "Help":
        return <HelpScreen navigate={navigate} />;
      default:
        return <CurrencyConverterScreen navigate={navigate} />;
    }
  };

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
      <SafeAreaProvider>{renderScreen()}</SafeAreaProvider>
    </CustomThemeProvider>
  );
}
