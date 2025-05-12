import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useUpdate } from "@/context/UpdateContext";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "./CustomText";

const UpdateSection = () => {
  const { isChecking, isUpdating, checkForUpdates, lastChecked } = useUpdate();
  const { colors } = useTheme();
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        setIsDevelopment(false);
        if (update.isAvailable) {
          const manifest = update.manifest as { version?: string };
          setUpdateVersion(manifest.version || null);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("development mode")
        ) {
          console.log("Running in development mode - update checks disabled");
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

  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion = Constants.expoConfig?.version;
  const version = Platform.OS === "web" ? webVersion : nativeVersion;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <CustomText
        variant="h6"
        fontFamily={Fonts.Medium}
        style={{ color: colors.text }}
      >
        App Updates
      </CustomText>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <CustomText variant="h6" style={{ color: colors.gray[400] }}>
            Version:
          </CustomText>
          <CustomText variant="h6" style={{ color: colors.text }}>
            v{version}
          </CustomText>
        </View>

        {isDevelopment ? (
          <View style={styles.infoRow}>
            <CustomText variant="h6" style={{ color: colors.gray[400] }}>
              Environment:
            </CustomText>
            <CustomText variant="h6" style={{ color: Colors.secondary }}>
              Development
            </CustomText>
          </View>
        ) : (
          updateVersion && (
            <View style={styles.infoRow}>
              <CustomText variant="h6" style={{ color: colors.gray[400] }}>
                New Version:
              </CustomText>
              <CustomText variant="h6" style={{ color: Colors.primary }}>
                v{updateVersion}
              </CustomText>
            </View>
          )
        )}

        <View style={styles.infoRow}>
          <CustomText variant="h6" style={{ color: colors.gray[400] }}>
            Last Checked:
          </CustomText>
          <CustomText variant="h6" style={{ color: colors.text }}>
            {formatLastChecked(lastChecked)}
          </CustomText>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (isChecking || isUpdating || isDevelopment) &&
              styles.buttonDisabled,
          ]}
          onPress={checkForUpdates}
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
                ? "Update Available"
                : "Check for Updates"}
            </CustomText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  content: {
    gap: 16,
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },
});

export default UpdateSection;
