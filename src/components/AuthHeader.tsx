import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/components/AuthHeader.styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { FC } from "react";
import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";

interface IconProps {
  onPress: () => void;
  color?: string;
}

interface AuthHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const Icon: FC<IconProps> = ({ onPress, color }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={styles.iconBtn}
    hitSlop={10}
  >
    <Ionicons name="arrow-back" size={Spacing.iconSize} style={{ color }} />
  </TouchableOpacity>
);

const AuthHeader: FC<AuthHeaderProps> = ({
  title,
  description,
  showBackButton = true,
}) => {
  const { colors } = useTheme();
  return (
    <View>
      {showBackButton && (
        <Icon onPress={() => router.back()} color={colors.primary} />
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
