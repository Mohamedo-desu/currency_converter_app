import { saveSecurely } from "@/store/storage";
import { PushTokenManager } from "@/utils/pushTokenManager";
import { Platform } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL + "/api" || "http://localhost:3000/api";

interface RegisterTokenResponse {
  success: boolean;
  message: string;
  tokenId?: string;
  alreadyExists?: boolean;
}

export class PushTokenService {
  /**
   * Registers a push token with the backend
   * @param pushToken - The Expo push token string
   * @returns Promise with registration response
   */
  static async registerPushToken(
    pushToken: string
  ): Promise<RegisterTokenResponse> {
    try {
      // Initialize device tracking to ensure consistent device ID and info
      const { deviceId, deviceInfo } =
        await PushTokenManager.initializeDeviceTracking();

      console.log("Registering push token with device info:", {
        deviceId,
        deviceInfo,
      });

      const response = await fetch(`${API_BASE_URL}/push-tokens/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pushToken,
          deviceId,
          platform: Platform.OS,
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
          modelName: deviceInfo.modelName,
          brand: deviceInfo.brand,
          manufacturer: deviceInfo.manufacturer,
          osName: deviceInfo.osName,
          osVersion: deviceInfo.osVersion,
          timestamp: new Date().toLocaleString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register push token");
      }

      return data;
    } catch (error) {
      console.error("Error registering push token:", error);
      throw error;
    }
  }

  /**
   * Saves push token registration status locally
   * @param pushToken - The push token string
   * @param tokenId - The backend token ID (optional)
   */
  static async savePushTokenRegistration(
    pushToken: string,
    tokenId?: string
  ): Promise<void> {
    try {
      const dataToSave = [
        { key: "pushTokenString", value: pushToken },
        { key: "pushTokenRegistered", value: "true" },
        { key: "pushTokenRegisteredAt", value: new Date().toISOString() },
      ];

      if (tokenId) {
        dataToSave.push({ key: "pushTokenId", value: tokenId });
      }

      saveSecurely(dataToSave);
    } catch (error) {
      console.error("Error saving push token registration:", error);
      throw error;
    }
  }
}
