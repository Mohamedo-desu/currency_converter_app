import { Fonts } from "@/constants/Fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: Fonts.Bold,

    marginTop: 15,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  iconBtn: { alignSelf: "flex-start" },
});
