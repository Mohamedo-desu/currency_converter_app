import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { fetchVersionInfo } from "@/services/versionService";
import { styles } from "@/styles/components/PrivacyTerms.styles";
import * as Application from "expo-application";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Linking, Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "./CustomText";

type Screen = "Converter" | "Settings" | "History" | "Help";
type Navigate = (screen: Screen) => void;

const PrivacyTerms = ({ navigate }: { navigate: Navigate }) => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const [backendVersion, setBackendVersion] = useState<string | null>(null);

  // pull version from native or web manifest
  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion =
    // Expo SDK ≥47
    Constants.manifest?.version ?? Constants.expoConfig?.version;
  const localVersion = Platform.OS === "web" ? webVersion : nativeVersion;

  useEffect(() => {
    const getBackendVersion = async () => {
      try {
        const versionInfo = await fetchVersionInfo();
        // Only update if we got version info (not null)
        if (versionInfo) {
          setBackendVersion(versionInfo.version);
        } else {
          // If null, use local version
          setBackendVersion(localVersion);
        }
      } catch (error) {
        console.error("Failed to fetch backend version:", error);
        // Fallback to local version if backend fetch fails
        setBackendVersion(localVersion);
      }
    };

    getBackendVersion();
  }, [localVersion]);

  const openPrivacyPolicy = () => {
    const url =
      "https://www.termsfeed.com/live/b9b83488-3035-4933-af3e-8cc8e964e4b4";
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Privacy Policy URL:", err)
    );
  };

  return (
    <View style={[styles.footer, { bottom: bottom + 10 }]}>
      {/* Help Link */}
      <View style={styles.helpLinkContainer}>
        <TouchableOpacity onPress={() => navigate("Help")} activeOpacity={0.8}>
          <CustomText
            variant="h6"
            fontWeight="medium"
            style={[styles.helpLink, { color: Colors.primary }]}
          >
            Need Help? Contact Support
          </CustomText>
        </TouchableOpacity>
      </View>

      {/* Privacy Policy and Terms */}
      <View style={styles.footerTextContainer}>
        <TouchableOpacity onPress={openPrivacyPolicy} activeOpacity={0.8}>
          <CustomText style={styles.footerText}>Privacy Policy</CustomText>
        </TouchableOpacity>
        <CustomText style={{ color: colors.gray[400] }}>•</CustomText>
        <TouchableOpacity onPress={openPrivacyPolicy} activeOpacity={0.8}>
          <CustomText style={styles.footerText}>Terms of Service</CustomText>
        </TouchableOpacity>
      </View>

      {/* Version Code */}
      <CustomText
        variant="h6"
        fontWeight="medium"
        style={[styles.versionCodeText, { color: colors.gray[400] }]}
      >
        v{backendVersion || localVersion}
      </CustomText>
    </View>
  );
};

export default PrivacyTerms;
