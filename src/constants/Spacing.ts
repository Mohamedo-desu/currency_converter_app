import { Platform } from "react-native";

export const Spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 32,

  // Screen padding
  screenPadding: Platform.select({
    ios: 16,
    android: 16,
    web: 24,
  }),

  // Component specific spacing
  cardPadding: 16,
  inputPadding: 12,
  buttonPadding: 12,
  iconPadding: 8,
  flagIconSize: 25,
  iconSize: 20,

  // Standard heights
  inputHeight: 45,
  inputBorderRadius: 5,

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 12,
    round: 9999,
  },

  // Margins
  margin: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  // Gaps
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
} as const;
