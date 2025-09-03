import { getStoredValues, saveSecurely } from "@/store/storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

/**
 * Generates or retrieves a unique device identifier
 * This ID aims to be persistent across app reinstalls by using device hardware identifiers
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    // Check if we already have a stored device ID
    const storedValues = getStoredValues(["deviceId"]);

    if (storedValues.deviceId) {
      return storedValues.deviceId;
    }

    // Generate a device ID using persistent device identifiers
    let generatedId: string;

    if (Platform.OS === "android") {
      // For Android, try to use Android ID (more persistent than installation ID)
      const androidId = Application.getAndroidId();

      if (androidId) {
        generatedId = `android-${androidId}`;
      } else {
        // Fallback: use device model + brand combination with a hash
        const deviceSignature =
          `${Device.brand}-${Device.modelName}-${Device.manufacturer}`.replace(
            /\s+/g,
            ""
          );
        const hash = deviceSignature.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        generatedId = `android-${Math.abs(hash)}-${deviceSignature.slice(
          0,
          8
        )}`;
      }
    } else if (Platform.OS === "ios") {
      // For iOS, use identifierForVendor which is more persistent
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) {
        generatedId = `ios-${iosId}`;
      } else {
        // Fallback for iOS
        const deviceSignature = `${Device.brand}-${Device.modelName}`.replace(
          /\s+/g,
          ""
        );
        const hash = deviceSignature.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        generatedId = `ios-${Math.abs(hash)}-${deviceSignature.slice(0, 8)}`;
      }
    } else {
      // Web or other platforms
      // Try to use a combination of navigator properties for web
      if (typeof window !== "undefined" && window.navigator) {
        const nav = window.navigator;
        const screen = window.screen;
        const deviceSignature = `${nav.userAgent}-${nav.language}-${screen.width}x${screen.height}`;
        const hash = deviceSignature.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        generatedId = `web-${Math.abs(hash)}`;
      } else {
        // Ultimate fallback
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 15);
        generatedId = `${Platform.OS}-${timestamp}-${random}`;
      }
    }

    // Store the generated ID for future use
    saveSecurely([{ key: "deviceId", value: generatedId }]);

    return generatedId;
  } catch (error) {
    console.error("Error generating device ID:", error);
    // Fallback to a simple random ID if everything fails
    const fallbackId = `fallback-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    try {
      saveSecurely([{ key: "deviceId", value: fallbackId }]);
    } catch (saveError) {
      console.error("Error saving fallback device ID:", saveError);
    }

    return fallbackId;
  }
};
