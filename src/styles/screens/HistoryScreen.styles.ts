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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  historyList: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  historyItem: {
    padding: Spacing.cardPadding,
    borderRadius: Spacing.borderRadius.lg,
    gap: Spacing.sm,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  flag: {
    width: 25,
    height: 25,
    borderRadius: Spacing.borderRadius.round,
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagOverlap: {
    marginLeft: -Spacing.sm,
  },
  historyDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  cleanupMessage: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    marginHorizontal: Spacing.screenPadding,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.md,
  },
  currencyColumn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
