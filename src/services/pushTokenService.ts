import { getStoredValues, saveSecurely } from "@/store/storage";

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
   * @param deviceId - Unique device identifier
   * @returns Promise with registration response
   */
  static async registerPushToken(
    pushToken: string,
    deviceId: string
  ): Promise<RegisterTokenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/push-tokens/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pushToken,
          deviceId,
          platform: require("react-native").Platform.OS,
          timestamp: new Date().toISOString(),
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
   * Checks if a push token is already registered locally
   * @returns Promise with boolean indicating if token exists
   */
  static async isPushTokenRegistered(): Promise<boolean> {
    try {
      const { pushTokenString, pushTokenRegistered } = getStoredValues([
        "pushTokenString",
        "pushTokenRegistered",
      ]);

      // Return true if we have both a token and registration confirmation
      return !!(pushTokenString && pushTokenRegistered === "true");
    } catch (error) {
      console.error("Error checking token registration status:", error);
      return false;
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
