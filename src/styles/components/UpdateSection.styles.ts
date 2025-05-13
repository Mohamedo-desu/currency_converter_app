import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginVertical: Spacing.sm,
  },
  content: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.inputPadding,
    borderRadius: Spacing.inputBorderRadius,
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.inputHeight,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.body,
  },
});
