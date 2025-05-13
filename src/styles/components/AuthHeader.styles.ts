import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.regular,
  },

  iconBtn: { alignSelf: "flex-start" },
});
