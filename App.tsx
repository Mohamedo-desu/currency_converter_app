// App.tsx
import { ThemeProvider } from "@/context/ThemeContext";
import RootLayout from "@/screens/RootLayout";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayout />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
