import { PushTokenService } from "@/services/pushTokenService";
import { getDeviceId } from "@/utils/deviceId";
import { getDeviceInfo } from "@/utils/deviceInfo";

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
   * Get the current device ID and ensure device info is cached
   */
  static async getCurrentDeviceId(): Promise<string | null> {
    try {
      // Ensure device info is cached when getting device ID
      getDeviceInfo(); // This will cache device info if not already cached
      return await getDeviceId();
    } catch (error) {
      console.error("Error getting device ID:", error);
      return null;
    }
  }

  /**
   * Initialize device tracking (cache both device ID and info)
   */
  static async initializeDeviceTracking(): Promise<{
    deviceId: string;
    deviceInfo: any;
  }> {
    try {
      const deviceInfo = getDeviceInfo(); // Cache device info
      const deviceId = await getDeviceId(); // Cache device ID

      return { deviceId, deviceInfo };
    } catch (error) {
      console.error("Error initializing device tracking:", error);
      throw error;
    }
  }
}
