import { Platform } from "react-native";

export const Typography = {
  // Font weights
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,

  // Font sizes
  fontSize: {
    h1: Platform.select({
      android: 24,
      ios: 22,
      web: 28,
    }),
    h2: Platform.select({
      android: 22,
      ios: 20,
      web: 24,
    }),
    h3: Platform.select({
      android: 20,
      ios: 18,
      web: 20,
    }),
    h4: Platform.select({
      android: 18,
      ios: 16,
      web: 18,
    }),
    h5: Platform.select({
      android: 16,
      ios: 14,
      web: 16,
    }),
    h6: Platform.select({
      android: 12,
      ios: 10,
      web: 14,
    }),
    h7: Platform.select({
      android: 10,
      ios: 9,
      web: 12,
    }),
    body: 14,
    small: 12,
    tiny: 10,
  } as const,

  // Line heights
  lineHeight: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 22,
    h5: 20,
    h6: 16,
    h7: 14,
    body: 20,
    small: 16,
    tiny: 14,
  } as const,
} as const;
