import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    ...(Platform.OS === "web" && {
      minWidth: 200,
    }),
  },
  label: {
    fontSize: 13,
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
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 10,
  },
  headerCurrency: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerCurrencyContainer: {
    marginTop: 15,
    gap: 15,
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
    right: 10,
  },
});
