import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

interface VersionInfo {
  _id: string;
  version: string;
  type: "major" | "minor" | "patch";
  releaseNotes?: string;
  createdAt: string;
  buildUrl?: string;
}

const getNativeVersion = (): string => {
  const nativeVersion = Application.nativeApplicationVersion;
  const webVersion = (Constants.expoConfig as any)?.version;
  return Platform.OS === "web" ? webVersion : nativeVersion;
};

export const fetchVersionInfo = async (
  major?: string
): Promise<VersionInfo | null> => {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

  try {
    const url = `${backendUrl}/api/version/latest${
      major ? `?major=${major}` : ""
    }`;
    console.log("[DEBUG] Fetching version from URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No version found in backend, using local version");
        return null;
      }
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }

    const data = await response.json();
    console.log("[DEBUG] Received version data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching version info:", error);
    return null;
  }
};
