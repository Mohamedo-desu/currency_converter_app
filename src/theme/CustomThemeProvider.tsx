import { Colors } from "@/constants/Colors";
import { getStoredValues, saveSecurely } from "@/store/storage";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: Dispatch<SetStateAction<ThemeMode>>;
}

interface CustomThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  gray: {
    500: string;
    400: string;
    300: string;
    200: string;
    100: string;
    50: string;
  };
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

const customDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.black,
    card: Colors.darkGray[100],
    text: Colors.white,
    border: Colors.darkGray[200],
    notification: Colors.secondary,
    gray: {
      500: "#B0B0B0",
      400: "#8A8A8A",
      300: "#545454",
      200: "#333333",
      100: "#1B1B1B",
      50: "#1b1a1a",
    },
  } as CustomThemeColors,
};

const customLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.white,
    card: Colors.lightGray[100],
    text: Colors.black,
    border: Colors.darkGray[200],
    notification: Colors.secondary,
    gray: {
      500: "#9E9E9E",
      400: "#BDBDBD",
      300: "#E0E0E0",
      200: "#EEEEEE",
      100: "#F5F5F5",
      50: "#fafafa",
    },
  } as CustomThemeColors,
};

const CustomThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<ThemeMode>(
    getStoredValues(["theme"]).theme || "dark"
  );
  const colorScheme = useColorScheme();

  const selectedTheme = useMemo(() => {
    const useSystemTheme = theme === "system";
    const appliedTheme = useSystemTheme ? colorScheme || "dark" : theme;

    saveSecurely([{ key: "theme", value: appliedTheme }]);

    return appliedTheme;
  }, [theme, colorScheme]);

  const currentNavigationTheme = useMemo(
    () => (selectedTheme === "dark" ? customDarkTheme : customLightTheme),
    [selectedTheme]
  );

  // useQuickActionRouting();

  return (
    <ThemeProvider value={currentNavigationTheme}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
      {/* <StatusBar style={selectedTheme === "dark" ? "light" : "dark"} /> */}
      <SystemBars style={selectedTheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
};

export default CustomThemeProvider;
