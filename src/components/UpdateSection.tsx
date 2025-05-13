import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTheme } from "@/context/ThemeContext";
import { useUpdate } from "@/context/UpdateContext";
import { styles } from "@/styles/components/UpdateSection.styles";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "./CustomText";

const UpdateSection = () => {
  const { isChecking, isUpdating, checkForUpdates, lastChecked } = useUpdate();
  const { colors } = useTheme();
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [isMajorUpdate, setIsMajorUpdate] = useState(false);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        setIsDevelopment(false);
        if (update.isAvailable) {
          const manifest = update.manifest as { version?: string };
          const newVersion = manifest.version || null;
          setUpdateVersion(newVersion);

          // Check if it's a major update
          if (newVersion) {
            const currentVersion =
              Platform.OS === "web"
                ? Constants.expoConfig?.version
                : Application.nativeApplicationVersion;

            if (currentVersion) {
              const currentMajor = currentVersion.split(".")[0];
              const newMajor = newVersion.split(".")[0];
              setIsMajorUpdate(newMajor > currentMajor);
            }
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("development mode")
        ) {
          setIsDevelopment(true);
        } else {
          console.error("Error checking for updates:", error);
        }
      }
    };
    checkEnvironment();
  }, [lastChecked]);

  const formatLastChecked = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    return "Just now";
  };

  const handleUpdate = async () => {
    if (isMajorUpdate) {
      // Replace with your Play Store link
      Linking.openURL(
        "https://play.google.com/store/apps/details?id=your.app.id"
      );
    } else {
      checkForUpdates();
    }
  };

  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion = Constants.expoConfig?.version;
  const version = Platform.OS === "web" ? webVersion : nativeVersion;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={{ flex: 1 }}>
            <CustomText
              variant="h5"
              fontWeight="medium"
              style={{ color: colors.text }}
            >
              App Updates
            </CustomText>
            <CustomText
              variant="h6"
              fontWeight="medium"
              style={{ color: colors.gray[400], marginTop: 4 }}
            >
              Version: v{version}
            </CustomText>
          </View>
          <Ionicons
            name="information-circle"
            size={Spacing.iconSize}
            color={colors.gray[400]}
          />
        </View>

        {isDevelopment ? (
          <View style={styles.infoRow}>
            <CustomText
              variant="h6"
              fontWeight="medium"
              style={{ color: colors.gray[400] }}
            >
              Environment:
            </CustomText>
            <CustomText
              variant="h6"
              fontWeight="medium"
              style={{ color: Colors.secondary }}
            >
              Development
            </CustomText>
          </View>
        ) : (
          updateVersion && (
            <View style={styles.infoRow}>
              <CustomText
                variant="h6"
                fontWeight="medium"
                style={{ color: colors.gray[400] }}
              >
                New Version:
              </CustomText>
              <CustomText variant="h6" style={{ color: Colors.primary }}>
                v{updateVersion}
              </CustomText>
            </View>
          )
        )}

        <View style={styles.infoRow}>
          <CustomText
            variant="h6"
            fontWeight="medium"
            style={{ color: colors.gray[400] }}
          >
            Last Checked:
          </CustomText>
          <CustomText
            variant="h7"
            fontWeight="medium"
            style={{ color: colors.text }}
          >
            {formatLastChecked(lastChecked)}
          </CustomText>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (isChecking || isUpdating || isDevelopment) &&
              styles.buttonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={isChecking || isUpdating || isDevelopment}
        >
          {isChecking || isUpdating ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <CustomText style={styles.buttonText}>
              {isDevelopment
                ? "Updates Disabled"
                : isChecking
                ? "Checking..."
                : isUpdating
                ? "Updating..."
                : updateVersion
                ? isMajorUpdate
                  ? "Update from Store"
                  : "Update Available"
                : "Check for Updates"}
            </CustomText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpdateSection;
