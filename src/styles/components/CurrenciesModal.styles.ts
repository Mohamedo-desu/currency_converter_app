import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" && {
      maxWidth: 500,
      marginHorizontal: "auto",
      width: "100%",
    }),
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: Spacing.inputBorderRadius,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    backgroundColor: "transparent",
    paddingHorizontal: Spacing.inputPadding,
    height: Spacing.inputHeight,
    borderRadius: Spacing.inputBorderRadius,
    gap: Spacing.gap.xs,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.body,
  },
  clearButton: {},
  currenciesList: {
    paddingBottom: Spacing.lg,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  flagIcon: {
    width: 30,
    height: 30,
    borderRadius: Spacing.borderRadius.round,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  currencyInfo: {
    flex: 1,
  },
});
