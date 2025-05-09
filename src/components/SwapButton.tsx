import { Colors } from "@/constants/Colors";
import { styles } from "@/styles/components/SwapButton.styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
          size={15}
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
