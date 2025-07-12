import { fetchVersionInfo } from "@/services/versionService";
import { getStoredValues, saveSecurely } from "@/store/storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

export const useVersion = () => {
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(true);

  // Get local version from native or web manifest
  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion = (Constants.expoConfig as any)?.version;
  const localVersion = Platform.OS === "web" ? webVersion : nativeVersion;

  const getMajorVersion = (version: string) => version.split(".")[0];

  // Fetch backend version with retry
  const fetchBackendVersion = useCallback(
    async (retryCount = 0, major?: string): Promise<string> => {
      try {
        const versionInfo = await fetchVersionInfo(major);

        if (versionInfo?.version) {
          return versionInfo.version;
        }
        throw new Error("No version info received");
      } catch (error) {
        if (retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchBackendVersion(retryCount + 1, major);
        }
        throw error;
      }
    },
    []
  );

  // Load cached version immediately
  useEffect(() => {
    const loadCachedVersion = async () => {
      try {
        const { cachedVersion } = await getStoredValues(["cachedVersion"]);
        if (cachedVersion) {
          setBackendVersion(cachedVersion);
        }
      } catch (error) {
        console.error("[DEBUG] Error loading cached version:", error);
      }
    };
    loadCachedVersion();
  }, []);

  // Check for updates and fetch version
  useEffect(() => {
    let isMounted = true;

    const checkUpdatesAndVersion = async () => {
      try {
        // Step 1: Check for OTA updates first
        if (Platform.OS !== "web") {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              saveSecurely([{ key: "cachedVersion", value: "" }]);
              return await Updates.reloadAsync();
            }
          } catch (error) {
            console.error("[DEBUG] OTA check error:", error);
          }
        }

        // Step 2: Get local version after potential OTA update
        const localMajor = getMajorVersion(localVersion);

        // Step 3: Fetch latest backend version
        const latestVersion = await fetchBackendVersion(0);
        const latestMajor = getMajorVersion(latestVersion);

        if (isMounted) {
          if (localMajor === latestMajor) {
            // Same major version - show backend version
            setBackendVersion(latestVersion);
            saveSecurely([{ key: "cachedVersion", value: latestVersion }]);
          } else if (parseInt(latestMajor) > parseInt(localMajor)) {
            // New major version available
            const versionInfo = await fetchVersionInfo();

            if (
              versionInfo?.type === "major" &&
              versionInfo?.downloadUrl &&
              versionInfo.downloadUrl !==
                "https://drive.google.com/placeholder" &&
              versionInfo.downloadUrl.trim() !== ""
            ) {
              Alert.alert(
                "New Build Available",
                `A new build (${latestVersion}) is available. Would you like to download it now?`,
                [
                  {
                    text: "Download Now",
                    onPress: () => {
                      if (versionInfo.downloadUrl) {
                        Linking.openURL(versionInfo.downloadUrl);
                      } else {
                        Alert.alert(
                          "Error",
                          "Download URL not available. Please try again later."
                        );
                      }
                    },
                  },
                  {
                    text: "Later",
                    style: "cancel",
                  },
                ]
              );
            }

            // Fetch compatible version for current major
            try {
              const versionInfo = await fetchVersionInfo(localMajor);

              if (versionInfo?.version) {
                const compatibleVersion = versionInfo.version;
                setBackendVersion(compatibleVersion);
                saveSecurely([
                  { key: "cachedVersion", value: compatibleVersion },
                ]);
              }
            } catch (error) {
              console.error(
                "[DEBUG] Error fetching compatible version:",
                error
              );
            }
          }
        }
      } catch (error: any) {
        if (isMounted) {
          setBackendVersion(localVersion);
          saveSecurely([{ key: "cachedVersion", value: localVersion }]);
          // Alert.alert("Error", error.message);
        }
      } finally {
        if (isMounted) {
          setIsCheckingUpdates(false);
        }
      }
    };

    checkUpdatesAndVersion();

    return () => {
      isMounted = false;
    };
  }, [localVersion, fetchBackendVersion]);

  return {
    backendVersion,
    localVersion,
    isCheckingUpdates,
    currentVersion: backendVersion || localVersion,
  };
};
