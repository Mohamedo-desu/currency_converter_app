import { fetchVersionInfo } from "@/services/versionService";
import { getStoredValues, saveSecurely } from "@/store/storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useVersion = () => {
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(true);
  const [isOtaChecked, setIsOtaChecked] = useState(false);

  // Get local version from native or web manifest
  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion =
    // Expo SDK ≥47
    (Constants.manifest as any)?.version ??
    (Constants.expoConfig as any)?.version;
  const localVersion = Platform.OS === "web" ? webVersion : nativeVersion;

  // Check for OTA updates on app launch
  useEffect(() => {
    const checkOtaUpdate = async () => {
      // Check for OTA updates in both development and production
      if (Platform.OS !== "web") {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // Clear cached version before reload to force fresh fetch
            saveSecurely([{ key: "cachedVersion", value: "" }]);
            await Updates.reloadAsync();
            return; // App will reload, so we don't need to continue
          }
        } catch (error) {
          console.error("Error checking for OTA updates:", error);
        }
      }
      setIsOtaChecked(true);
    };

    checkOtaUpdate();
  }, []); // Run only on mount

  // Fetch backend version
  const fetchLatestVersion = async () => {
    try {
      const versionInfo = await fetchVersionInfo();
      if (versionInfo) {
        setBackendVersion(versionInfo.version);
        saveSecurely([{ key: "cachedVersion", value: versionInfo.version }]);
      } else {
        setBackendVersion(localVersion);
        saveSecurely([{ key: "cachedVersion", value: localVersion }]);
      }
    } catch (error) {
      console.error("Failed to fetch backend version:", error);
      setBackendVersion(localVersion);
      saveSecurely([{ key: "cachedVersion", value: localVersion }]);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Load cached version and fetch latest on mount
  useEffect(() => {
    const initializeVersion = async () => {
      const stored = getStoredValues(["cachedVersion"]);
      if (stored.cachedVersion) {
        setBackendVersion(stored.cachedVersion);
      }
      // Always fetch latest version from backend
      await fetchLatestVersion();
    };
    initializeVersion();
  }, []);

  // Fetch backend version after OTA check
  useEffect(() => {
    if (isOtaChecked) {
      fetchLatestVersion();
    }
  }, [isOtaChecked]);

  return {
    backendVersion,
    localVersion,
    isCheckingUpdates,
    currentVersion: backendVersion || localVersion,
  };
};
