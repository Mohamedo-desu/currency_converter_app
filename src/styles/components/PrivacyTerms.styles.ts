import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
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
    gap: 2,
  },
  footerTextContainer: {
    flexDirection: "row",
    gap: Spacing.gap.xs,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerText: {
    textDecorationLine: "underline",
    fontSize: Typography.fontSize.tiny,
    color: Colors.primary,
  },
  versionCodeText: {
    textAlign: "center",
    fontSize: Typography.fontSize.tiny,
    ...(Platform.OS === "web" && {
      fontSize: Typography.fontSize.small,
    }),
  },
  helpLinkContainer: {},
  helpLink: {
    textDecorationLine: "underline",
    fontSize: Typography.fontSize.small,
  },
});
