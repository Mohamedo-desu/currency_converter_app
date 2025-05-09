import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  breakerContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
    width: "100%",
    marginVertical: 15,
    flexDirection: "row",
  },
  horizontalLine: {
    height: 1,
    width: "100%",
  },

  icon: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 10,
  },
});
