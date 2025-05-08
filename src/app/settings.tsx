import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

const SettingsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
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
        <Ionicons name={icon} size={RFValue(20)} color={Colors.primary} />
        <CustomText
          variant="h5"
          fontFamily={Fonts.Medium}
          style={{ color: colors.text, marginLeft: 10 }}
        >
          {title}
        </CustomText>
      </View>
      <Ionicons
        name="chevron-forward"
        size={RFValue(20)}
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
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={RFValue(24)}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <CustomText variant="h4" fontFamily={Fonts.Bold}>
          Settings
        </CustomText>
        <View style={{ width: RFValue(24) }} />
      </View>

      {/* Settings Content */}
      <View style={styles.content}>
        {renderSettingOption("time-outline", "History", () =>
          router.push("/history")
        )}
        {renderSettingOption("chatbubble-outline", "Feedback", () =>
          router.push("/feedback")
        )}
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
    gap: 15,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
});
