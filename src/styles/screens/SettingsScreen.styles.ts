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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
    gap: 15,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
});
