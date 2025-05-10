import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { styles } from "@/styles/screens/SettingsScreen.styles";
import { ThemeContext } from "@/theme/CustomThemeProvider";
import { Navigate } from "@/types/AuthHeader.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = ({ navigate }: { navigate: Navigate }) => {
  const { colors } = useContext(ThemeContext);
  const { top } = useSafeAreaInsets();

  const renderSettingOption = (
    icon: string,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
        <CustomText
          variant="h5"
          fontFamily={Fonts.Medium}
          style={{ color: colors.text, marginLeft: 10 }}
        >
          {title}
        </CustomText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigate("Converter")}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <CustomText variant="h4" fontFamily={Fonts.Bold}>
          Settings
        </CustomText>
        <View style={{ width: 24 }} />
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {renderSettingOption("time-outline", "History", () =>
          navigate("History")
        )}
      </View>
    </View>
  );
};

export default SettingsScreen;
