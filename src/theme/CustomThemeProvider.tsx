import { Colors } from "@/constants/Colors";
import { getStoredValues, saveSecurely } from "@/store/storage";
import React, {
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

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: Dispatch<SetStateAction<ThemeMode>>;
  colors: CustomThemeColors;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  colors: {
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
  },
});

const customDarkTheme: CustomThemeColors = {
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
};

const customLightTheme: CustomThemeColors = {
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
};

const CustomThemeProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  // Load saved theme or default to 'dark'
  const [theme, setTheme] = useState<ThemeMode>(
    getStoredValues(["theme"]).theme || "dark"
  );
  const systemScheme = useColorScheme();

  // Resolve actual theme (light/dark) based on user choice or system setting
  const resolvedTheme = useMemo<ThemeMode>(() => {
    const applied = theme === "system" ? systemScheme || "dark" : theme;
    // Persist the chosen/applied theme
    saveSecurely([{ key: "theme", value: applied }]);
    return applied;
  }, [theme, systemScheme]);

  // Select color palette
  const colors = useMemo<CustomThemeColors>(
    () => (resolvedTheme === "dark" ? customDarkTheme : customLightTheme),
    [resolvedTheme]
  );

  return (
    <>
      <ThemeContext.Provider value={{ theme, setTheme, colors }}>
        {children}
      </ThemeContext.Provider>
      <SystemBars style={resolvedTheme === "dark" ? "light" : "dark"} />
    </>
  );
};

export default CustomThemeProvider;
