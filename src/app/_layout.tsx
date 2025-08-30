import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
