import { Colors } from "@/constants/Colors";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    ...(Platform.OS === "web" && {
      maxWidth: 800,
      marginHorizontal: "auto",
    }),
  },
  footerTextContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
  },
  footerText: {
    textDecorationLine: "underline",
    fontSize: 10,
    color: Colors.primary,
  },
  versionCodeText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 11,
    ...(Platform.OS === "web" && {
      fontSize: 12,
    }),
  },
  helpLinkContainer: {
    marginBottom: 5,
  },
  helpLink: {
    textDecorationLine: "underline",
    fontSize: 12,
  },
});
