import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from "react-native-unistyles";

const BreakerText = () => {
  return (
    <View style={styles.breakerContainer}>
      <View style={styles.horizontalLine} />
      <View style={styles.icon}>
        <MaterialIcons
          name="currency-exchange"
          size={RFValue(25)}
          color={Colors.white}
        />
      </View>
      <View style={styles.horizontalLine} />
    </View>
  );
};

export default BreakerText;

const styles = StyleSheet.create((theme) => ({
  breakerContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
    width: "100%",
    marginVertical: 20,
    flexDirection: "row",
  },
  horizontalLine: {
    height: 1,
    width: "100%",
    backgroundColor: theme.Colors.gray[300],
  },

  icon: {
    backgroundColor: theme.Colors.primary,
    borderRadius: moderateScale(50),
    padding: 10,
  },
}));
