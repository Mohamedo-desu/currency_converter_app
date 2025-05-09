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
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
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
    paddingTop: 10,
    paddingBottom: 40,
    gap: 15,
  },
  historyItem: {
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyPair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flag: {
    width: 25,
    height: 25,
    borderRadius: 25,
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagOverlap: {
    marginLeft: -10,
  },
  historyDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  cleanupMessage: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  currencyColumn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
