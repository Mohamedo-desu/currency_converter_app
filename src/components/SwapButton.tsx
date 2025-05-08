import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale } from "react-native-size-matters";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const SwapButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    rotation.value = withSequence(
      withTiming(180, { duration: 300 }),
      withTiming(360, { duration: 300 })
    );
    scale.value = withSequence(
      withTiming(0.8, { duration: 300 }),
      withTiming(1, { duration: 300 })
    );
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={styles.breakerContainer}>
      <View
        style={[styles.horizontalLine, { backgroundColor: colors.gray[300] }]}
      />
      <AnimatedTouchableOpacity
        onPress={handlePress}
        style={[styles.icon, animatedStyle]}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="currency-exchange"
          size={RFValue(15)}
          color={Colors.white}
        />
      </AnimatedTouchableOpacity>
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
