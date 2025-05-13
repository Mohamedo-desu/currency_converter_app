import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

interface VersionInfo {
  version: string;
  type: "major" | "minor" | "patch";
  releaseNotes?: string;
}

const getNativeVersion = (): string => {
  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion =
    Constants.manifest?.version ?? Constants.expoConfig?.version;
  return Platform.OS === "web" ? webVersion : nativeVersion;
};

export const fetchVersionInfo = async (): Promise<VersionInfo | null> => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  try {
    const url = `${backendUrl}/api/version/latest`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText); // Debug log
      throw new Error(
        `Failed to fetch version info: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // If it's a major update, check if it matches native version
    if (data.type === "major") {
      const nativeVersion = getNativeVersion();

      // Only return major update if versions match
      if (data.version === nativeVersion) {
        return data;
      }
      return null;
    }

    // For minor and patch updates, always return the data
    return data;
  } catch (error) {
    console.error("Error fetching version info:", error);
    throw error;
  }
};
