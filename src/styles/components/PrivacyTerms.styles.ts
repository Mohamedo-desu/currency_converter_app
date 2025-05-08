import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
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
    fontSize: RFValue(10),
    color: Colors.primary,
  },
  versionCodeText: {
    textAlign: "center",
    marginBottom: 15,
  },
});
