import { getStoredValues, saveSecurely } from "@/store/storage";
import { StatusBar } from "expo-status-bar";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

const CustomThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(
    getStoredValues(["theme"]).theme || "light"
  );
  const colorScheme = useColorScheme();

  const selectedTheme: any = useMemo(() => {
    const useSystemTheme = theme === "system";
    const appliedTheme = useSystemTheme ? colorScheme : theme;

    UnistylesRuntime.setAdaptiveThemes(useSystemTheme);
    return appliedTheme;
  }, [theme, colorScheme]);

  useEffect(() => {
    if (theme !== "system") {
      UnistylesRuntime.setTheme(selectedTheme);
      saveSecurely([{ key: "theme", value: selectedTheme }]);
    }
  }, [selectedTheme]);

  return (
    <>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
      <StatusBar style={selectedTheme === "dark" ? "light" : "dark"} />
    </>
  );
};

export default CustomThemeProvider;
