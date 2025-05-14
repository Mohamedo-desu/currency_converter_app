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
          console.log("[DEBUG] Starting OTA check");
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            console.log("[DEBUG] OTA update available");
            await Updates.fetchUpdateAsync();
            // Clear cached version before reload to force fresh fetch
            saveSecurely([{ key: "cachedVersion", value: "" }]);
            await Updates.reloadAsync();
            return; // App will reload, so we don't need to continue
          }
          console.log("[DEBUG] No OTA update available");
        } catch (error) {
          console.error("[DEBUG] OTA check error:", error);
        }
      }
      console.log("[DEBUG] Setting OTA check complete");
      setIsOtaChecked(true);
    };

    checkOtaUpdate();
  }, []); // Run only on mount

  // Fetch backend version
  const fetchLatestVersion = async () => {
    try {
      console.log("[DEBUG] Fetching latest version from backend");
      const versionInfo = await fetchVersionInfo();
      console.log("[DEBUG] Backend version response:", versionInfo);

      if (versionInfo) {
        console.log("[DEBUG] Setting backend version:", versionInfo.version);
        setBackendVersion(versionInfo.version);
        saveSecurely([{ key: "cachedVersion", value: versionInfo.version }]);
      } else {
        console.log(
          "[DEBUG] No version info, using local version:",
          localVersion
        );
        setBackendVersion(localVersion);
        saveSecurely([{ key: "cachedVersion", value: localVersion }]);
      }
    } catch (error) {
      console.error("[DEBUG] Version fetch error:", error);
      setBackendVersion(localVersion);
      saveSecurely([{ key: "cachedVersion", value: localVersion }]);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Load cached version and fetch latest on mount
  useEffect(() => {
    const initializeVersion = async () => {
      console.log("[DEBUG] Initializing version");
      const stored = getStoredValues(["cachedVersion"]);
      console.log("[DEBUG] Cached version:", stored.cachedVersion);

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
    console.log("[DEBUG] OTA check status changed:", isOtaChecked);
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
