import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RootLayout = () => {
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

export default RootLayout;
