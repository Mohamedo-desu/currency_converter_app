import { getStoredValues, saveSecurely } from "@/store/storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Generates or retrieves a unique device identifier
 * This ID is persistent across app launches but will change if the app is uninstalled
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    // Check if we already have a stored device ID
    const { deviceId } = await getStoredValues(["deviceId"]);

    if (deviceId) {
      return deviceId;
    }

    // Generate a new device ID using available device information
    let generatedId: string;

    // Try to use installation ID from Expo
    if (Constants.installationId) {
      generatedId = Constants.installationId;
    } else {
      // Fallback: generate a unique ID based on device info and timestamp
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 15);
      const platform = Platform.OS;

      generatedId = `${platform}-${timestamp}-${random}`;
    }

    // Store the generated ID for future use
    await saveSecurely([{ key: "deviceId", value: generatedId }]);

    return generatedId;
  } catch (error) {
    console.error("Error generating device ID:", error);
    // Fallback to a simple random ID if everything fails
    const fallbackId = `fallback-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    try {
      await saveSecurely([{ key: "deviceId", value: fallbackId }]);
    } catch (saveError) {
      console.error("Error saving fallback device ID:", saveError);
    }

    return fallbackId;
  }
};

/**
 * Clears the stored device ID (useful for testing or user logout)
 */
export const clearDeviceId = async (): Promise<void> => {
  try {
    const { deleteStoredValues } = await import("@/store/storage");
    await deleteStoredValues(["deviceId"]);
  } catch (error) {
    console.error("Error clearing device ID:", error);
  }
};
