import { fetchVersionInfo } from "@/services/versionService";
import { saveSecurely } from "@/store/storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

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
        console.log("[DEBUG] Local major version:", localMajor);

        // Step 3: Fetch latest backend version
        const latestVersion = await fetchBackendVersion(0);
        const latestMajor = getMajorVersion(latestVersion);
        console.log("[DEBUG] Latest backend version:", latestVersion);

        if (isMounted) {
          if (localMajor === latestMajor) {
            // Same major version - show backend version
            setBackendVersion(latestVersion);
            saveSecurely([{ key: "cachedVersion", value: latestVersion }]);
            Alert.alert(
              "Version Information",
              `No new build available.\nLatest version: ${latestVersion}`
            );
          } else if (parseInt(latestMajor) > parseInt(localMajor)) {
            // New major version available
            Alert.alert(
              "New Build Available",
              `A new build (${latestVersion}) is available. Please update your app.`
            );

            // Fetch compatible version for current major
            try {
              const versionInfo = await fetchVersionInfo(localMajor);
              console.log("[DEBUG] Compatible version info:", versionInfo);

              if (versionInfo?.version) {
                const compatibleVersion = versionInfo.version;
                console.log(
                  "[DEBUG] Setting compatible version:",
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
        if (isMounted) {
          setBackendVersion(localVersion);
          saveSecurely([{ key: "cachedVersion", value: localVersion }]);
          Alert.alert("Error", error.message);
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
