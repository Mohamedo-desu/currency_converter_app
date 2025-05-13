import { fetchVersionInfo } from "@/services/versionService";
import { getStoredValues, saveSecurely } from "@/store/storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useVersion = () => {
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(true);

  // Get local version from native or web manifest
  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion =
    // Expo SDK ≥47
    Constants.manifest?.version ?? Constants.expoConfig?.version;
  const localVersion = Platform.OS === "web" ? webVersion : nativeVersion;

  // Load cached version on mount
  useEffect(() => {
    const loadCachedVersion = async () => {
      const stored = getStoredValues(["cachedVersion"]);
      if (stored.cachedVersion) {
        setBackendVersion(stored.cachedVersion);
      }
    };
    loadCachedVersion();
  }, []);

  // Check for updates and fetch backend version
  useEffect(() => {
    const checkVersions = async () => {
      try {
        const versionInfo = await fetchVersionInfo();
        // Only update if we got version info (not null)
        if (versionInfo) {
          setBackendVersion(versionInfo.version);
          // Cache the version
          saveSecurely([{ key: "cachedVersion", value: versionInfo.version }]);
        } else {
          // If null, use local version
          setBackendVersion(localVersion);
          // Cache the local version
          saveSecurely([{ key: "cachedVersion", value: localVersion }]);
        }
      } catch (error) {
        console.error("Failed to fetch backend version:", error);
        // Fallback to local version if backend fetch fails
        setBackendVersion(localVersion);
        // Cache the local version as fallback
        saveSecurely([{ key: "cachedVersion", value: localVersion }]);
      } finally {
        setIsCheckingUpdates(false);
      }
    };

    checkVersions();
  }, [localVersion]);

  return {
    backendVersion,
    localVersion,
    isCheckingUpdates,
    currentVersion: backendVersion || localVersion,
  };
};
