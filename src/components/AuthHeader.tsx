import { styles } from "@/styles/components/AuthHeader.styles";
import { ThemeContext } from "@/theme/CustomThemeProvider";
import { AuthHeaderProps, IconProps } from "@/types/AuthHeader.types";
import { Ionicons } from "@expo/vector-icons";
import React, { FC, useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Icon: FC<IconProps> = ({ onPress, color }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={styles.iconBtn}
    hitSlop={10}
  >
    <Ionicons name="arrow-back" size={24} style={{ color }} />
  </TouchableOpacity>
);

const AuthHeader: FC<AuthHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  Navigate,
}) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View>
      {showBackButton && (
        <Icon onPress={() => Navigate("Converter")} color={colors.text} />
      )}

      {title && (
        <Text
          style={[styles.title, { color: colors.text }]}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
      )}
      {description && (
        <Text
          style={[styles.description, { color: colors.gray[500] }]}
          adjustsFontSizeToFit
        >
          {description}
        </Text>
      )}
    </View>
  );
};

export default AuthHeader;
