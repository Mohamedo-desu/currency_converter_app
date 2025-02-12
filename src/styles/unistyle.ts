import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { getStoredValues } from "@/store/storage";
import { RFValue } from "react-native-responsive-fontsize";
import { StyleSheet } from "react-native-unistyles";

export const lightTheme = {
  Colors: {
    typography: "#141414",
    background: "#ffffff",
    gray: {
      500: "#9E9E9E",
      400: "#BDBDBD",
      300: "#E0E0E0",
      200: "#EEEEEE",
      100: "#F5F5F5",
      50: "#fafafa",
    },
    ...Colors,
  },

  fonts: Fonts,
  margins: {
    sm: RFValue(4),
    md: RFValue(8),
    lg: RFValue(16),
    xl: RFValue(24),
  },
  border: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
};
export const darkTheme = {
  Colors: {
    typography: "#ffffff",
    background: "#141414",
    gray: {
      500: "#B0B0B0",
      400: "#8A8A8A",
      300: "#545454",
      200: "#333333",
      100: "#1B1B1B",
      50: "#1b1a1a",
    },
    ...Colors,
  },

  fonts: Fonts,
  margins: {
    sm: RFValue(4),
    md: RFValue(8),
    lg: RFValue(16),
    xl: RFValue(24),
  },
  border: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

const breakpoints = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 800,
  xl: 1200,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    initialTheme: () => {
      return getStoredValues(["theme"]).theme || "light";
    },
  },
  breakpoints,
  themes: appThemes,
});
