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
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);

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

  // Load cached version immediately on app start
  useEffect(() => {
    const loadCachedVersion = async () => {
      try {
        const { cachedVersion } = await getStoredValues(["cachedVersion"]);
        if (cachedVersion) {
          console.log("[DEBUG] Loading cached version:", cachedVersion);
          setBackendVersion(cachedVersion);
        } else {
          console.log("[DEBUG] No cached version found - first time load");
        }
      } catch (error) {
        console.error("[DEBUG] Error loading cached version:", error);
      } finally {
        setIsLoadingFromCache(false);
      }
    };
    loadCachedVersion();
  }, []);

  // Fetch fresh version data from backend after loading cached version
  useEffect(() => {
    let isMounted = true;

    const fetchFreshVersion = async () => {
      // Only start fetching after cache is loaded
      if (isLoadingFromCache) return;

      try {
        console.log("[DEBUG] Fetching fresh version from backend...");

        // Step 1: Check for OTA updates first (for non-web platforms)
        if (Platform.OS !== "web") {
          try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              console.log("[DEBUG] OTA update available, downloading...");
              await Updates.fetchUpdateAsync();
              // Clear cache since we're about to reload with new version
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
            // Same major version - update with backend version and cache it
            console.log(
              "[DEBUG] Same major version, updating to:",
              latestVersion
            );
            setBackendVersion(latestVersion);
            saveSecurely([{ key: "cachedVersion", value: latestVersion }]);
          } else if (parseInt(latestMajor) > parseInt(localMajor)) {
            // New major version available
            console.log("[DEBUG] New major version available:", latestVersion);
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
                console.log(
                  "[DEBUG] Using compatible version:",
                  compatibleVersion
                );
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
        console.error("[DEBUG] Error fetching fresh version:", error);
        if (isMounted) {
          // If we already have a cached version, keep it; otherwise use local version
          if (!backendVersion) {
            console.log(
              "[DEBUG] No cached version, falling back to local version"
            );
            setBackendVersion(localVersion);
            saveSecurely([{ key: "cachedVersion", value: localVersion }]);
          }
        }
      } finally {
        if (isMounted) {
          setIsCheckingUpdates(false);
        }
      }
    };

    fetchFreshVersion();

    return () => {
      isMounted = false;
    };
  }, [localVersion, fetchBackendVersion, isLoadingFromCache, backendVersion]);

  return {
    backendVersion,
    localVersion,
    isCheckingUpdates,
    isLoadingFromCache,
    currentVersion: backendVersion || localVersion,
  };
};
