import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet } from "react-native-unistyles";

const SwapButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <View style={styles.breakerContainer}>
      <View style={styles.horizontalLine} />
      <TouchableOpacity
        onPress={onPress}
        style={styles.icon}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="currency-exchange"
          size={RFValue(20)}
          color={Colors.white}
        />
      </TouchableOpacity>
      <View style={styles.horizontalLine} />
    </View>
  );
};

export default SwapButton;

const styles = StyleSheet.create((theme) => ({
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
    backgroundColor: theme.Colors.gray[300],
  },

  icon: {
    backgroundColor: theme.Colors.primary,
    borderRadius: moderateScale(50),
    padding: 10,
  },
}));
