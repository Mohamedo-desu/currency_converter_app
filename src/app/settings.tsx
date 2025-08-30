import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { styles } from "@/styles/screens/SettingsScreen.styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = () => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  // Add back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push("/");
        return true; // Prevent default behavior (exit app)
      }
    );

    // Cleanup listener on unmount
    return () => backHandler.remove();
  }, []);

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
      <View style={[styles.header, { paddingTop: top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={Spacing.iconSize}
            color={Colors.primary}
          />
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
        {renderSettingOption("time", "History", () =>
          router.navigate("/history")
        )}
      </View>
    </View>
  );
};

export default SettingsScreen;
