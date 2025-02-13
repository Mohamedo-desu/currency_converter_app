import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";

const SwapButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.breakerContainer}>
      <View
        style={[styles.horizontalLine, { backgroundColor: colors.gray[300] }]}
      />
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
      <View
        style={[styles.horizontalLine, { backgroundColor: colors.gray[300] }]}
      />
    </View>
  );
};

export default SwapButton;

const styles = StyleSheet.create({
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
    borderRadius: moderateScale(50),
    padding: 10,
  },
});
