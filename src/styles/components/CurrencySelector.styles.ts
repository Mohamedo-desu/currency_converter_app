import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    padding: Spacing.inputPadding,
    borderRadius: Spacing.inputBorderRadius,
    ...(Platform.OS === "web" && {
      minWidth: 200,
    }),
  },
  label: {
    fontSize: Typography.fontSize.small,
  },
  amountContainer: {
    ...(Platform.OS === "web" && {
      maxWidth: 600,
      width: "100%",
    }),
  },
  flagIcon: {
    width: 30,
    height: 30,
    borderRadius: Spacing.borderRadius.round,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  headerCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  headerCurrencyContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
    ...(Platform.OS === "web" && {
      width: "100%",
    }),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    ...(Platform.OS === "web" && {
      width: "100%",
    }),
  },
  clearButton: {
    position: "absolute",
    right: Spacing.sm,
  },
});
