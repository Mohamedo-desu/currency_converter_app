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
  },
  footerTextContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xs,
    flexWrap: "wrap",
  },
  footerText: {
    textDecorationLine: "underline",
    fontSize: Typography.fontSize.tiny,
    color: Colors.primary,
  },
  versionCodeText: {
    textAlign: "center",
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.tiny,
    ...(Platform.OS === "web" && {
      fontSize: Typography.fontSize.small,
    }),
  },
  helpLinkContainer: {
    marginBottom: Spacing.xs,
  },
  helpLink: {
    textDecorationLine: "underline",
    fontSize: Typography.fontSize.small,
  },
});
