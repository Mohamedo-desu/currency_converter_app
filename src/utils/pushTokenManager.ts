import { PushTokenService } from "@/services/pushTokenService";
import { getDeviceId } from "@/utils/deviceId";

/**
 * Utility functions for push token management
 */
export class PushTokenManager {
  /**
   * Check if push notifications are properly set up
   */
  static async isPushNotificationSetup(): Promise<boolean> {
    try {
      return await PushTokenService.isPushTokenRegistered();
    } catch (error) {
      console.error("Error checking push notification setup:", error);
      return false;
    }
  }

  /**
   * Get the current device ID
   */
  static async getCurrentDeviceId(): Promise<string | null> {
    try {
      return await getDeviceId();
    } catch (error) {
      console.error("Error getting device ID:", error);
      return null;
    }
  }
}
