import { Spacing } from "@/constants/Spacing";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === "web" && {
      maxWidth: 500,
      marginHorizontal: "auto",
      width: "100%",
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  card: {
    paddingVertical: Spacing.cardPadding,
    padding: Spacing.cardPadding,
    borderRadius: Spacing.inputBorderRadius,
    marginTop: Spacing.xxl,
    ...(Platform.OS === "web" && {
      maxWidth: 500,
      marginHorizontal: "auto",
      width: "100%",
    }),
  },
  exchangeRateContainer: {
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
  },
});
