import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  breakerContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    overflow: "hidden",
    width: "100%",
    marginVertical: Spacing.md,
    flexDirection: "row",
  },
  horizontalLine: {
    height: 1,
    width: "100%",
  },

  icon: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.borderRadius.round,
    padding: Spacing.iconPadding,
  },
});
