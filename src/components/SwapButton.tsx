import { Colors } from "@/constants/Colors";
import { styles } from "@/styles/components/SwapButton.styles";
import { ThemeContext } from "@/theme/CustomThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";

const SwapButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useContext(ThemeContext);

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
          size={15}
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
