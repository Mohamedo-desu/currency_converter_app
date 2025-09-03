import { getStoredValues, saveSecurely } from "@/store/storage";
import * as Device from "expo-device";

export const getDeviceInfo = () => {
  try {
    // Check if we already have cached device info
    const storedValues = getStoredValues(["deviceInfo"]);

    if (storedValues.deviceInfo) {
      return JSON.parse(storedValues.deviceInfo);
    }

    // Generate device info for the first time
    const deviceInfo = {
      deviceName: Device.deviceName || "Unknown",
      deviceType: Device.deviceType || "Unknown",
      modelName: Device.modelName || "Unknown",
      brand: Device.brand || "Unknown",
      manufacturer: Device.manufacturer || "Unknown",
      osName: Device.osName || "Unknown",
      osVersion: Device.osVersion || "Unknown",
    };

    // Cache the device info for future use
    saveSecurely([{ key: "deviceInfo", value: JSON.stringify(deviceInfo) }]);

    return deviceInfo;
  } catch (error) {
    console.error("Error getting device info:", error);
    // Return fallback device info if everything fails
    return {
      deviceName: "Unknown",
      deviceType: "Unknown",
      modelName: "Unknown",
      brand: "Unknown",
      manufacturer: "Unknown",
      osName: "Unknown",
      osVersion: "Unknown",
    };
  }
};
