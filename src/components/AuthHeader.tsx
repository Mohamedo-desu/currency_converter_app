import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/components/AuthHeader.styles";
import { AuthHeaderProps, IconProps } from "@/types/AuthHeader.types";
import { Ionicons } from "@expo/vector-icons";
import React, { FC } from "react";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";

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
  const { colors } = useTheme();
  return (
    <View>
      {showBackButton && (
        <Icon onPress={() => Navigate("Converter")} color={colors.primary} />
      )}

      {title && <CustomText style={styles.title}>{title}</CustomText>}
      {description && (
        <CustomText
          variant="h6"
          fontWeight="medium"
          style={{ color: colors.gray[400] }}
        >
          {description}
        </CustomText>
      )}
    </View>
  );
};

export default AuthHeader;
