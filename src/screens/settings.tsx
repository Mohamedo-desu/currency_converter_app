import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/screens/SettingsScreen.styles";
import { Navigate } from "@/types/AuthHeader.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = ({ navigate }: { navigate: Navigate }) => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const renderSettingOption = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={Spacing.iconSize} color={Colors.primary} />
        <CustomText
          variant="h5"
          fontWeight="medium"
          style={{ color: colors.text, marginLeft: 10 }}
        >
          {title}
        </CustomText>
      </View>
      <Ionicons
        name="chevron-forward"
        size={Spacing.iconSize}
        color={colors.gray[400]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top }]}>
        <TouchableOpacity
          onPress={() => navigate("Converter")}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <CustomText
          variant="h4"
          fontWeight="bold"
          style={{ color: colors.text }}
        >
          Settings
        </CustomText>
        <View style={{ width: 24 }} />
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {renderSettingOption("help-circle", "Help & Support", () =>
          navigate("Help")
        )}
        {renderSettingOption("time", "History", () => navigate("History"))}
      </View>
    </View>
  );
};

export default SettingsScreen;
