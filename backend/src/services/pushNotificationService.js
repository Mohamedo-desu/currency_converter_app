const PushToken = require("../models/PushToken");

class PushNotificationService {
  constructor() {
    this.expoPushURL = "https://exp.host/--/api/v2/push/send";
  }

  /**
   * Validate if a token is a valid Expo push token
   * @param {string} token - Push token to validate
   * @returns {boolean} Whether token is valid
   */
  isValidExpoPushToken(token) {
    return (
      token &&
      (token.startsWith("ExponentPushToken[") ||
        token.startsWith("ExpoPushToken["))
    );
  }

  /**
   * Send push notification to a single token
   * @param {string} expoPushToken - Expo push token
   * @param {Object} notification - Notification data
   * @returns {Promise} Result of sending notification
   */
  async sendSingleNotification(expoPushToken, notification) {
    try {
      const message = {
        to: expoPushToken,
        sound: "update.wav",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: "high",
        channelId: "default",
      };

      const response = await fetch(this.expoPushURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${result.message || "Unknown error"}`
        );
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(`Error sending notification to ${expoPushToken}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send push notifications to multiple tokens
   * @param {Array} tokens - Array of push tokens
   * @param {Object} notification - Notification data
   * @returns {Promise} Result of sending notifications
   */
  async sendBatchNotifications(tokens, notification) {
    try {
      const messages = tokens.map((token) => ({
        to: token,
        sound: "update.wav",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: "high",
        channelId: "default",
      }));

      const response = await fetch(this.expoPushURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const results = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${results.message || "Unknown error"}`
        );
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error("Error sending batch notifications:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send push notification to all active tokens
   * @param {Object} notification - Notification data
   * @param {string} notification.title - Notification title
   * @param {string} notification.body - Notification body
   * @param {Object} notification.data - Additional data payload
   * @param {Array} platforms - Target platforms ['ios', 'android', 'web']
   * @returns {Promise} Result of sending notifications
   */
  async sendToAllUsers(notification, platforms = ["ios", "android"]) {
    try {
      console.log("Starting push notification send to all users...");

      // Get all active push tokens
      const activeTokens = await PushToken.find({
        isActive: true,
        platform: { $in: platforms },
      });

      if (activeTokens.length === 0) {
        console.log("No active push tokens found");
        return { success: true, sent: 0, errors: [] };
      }

      console.log(`Found ${activeTokens.length} active push tokens`);

      // Filter valid tokens
      const validTokens = activeTokens
        .filter((tokenDoc) => this.isValidExpoPushToken(tokenDoc.pushToken))
        .map((tokenDoc) => tokenDoc.pushToken);

      if (validTokens.length === 0) {
        console.log("No valid push tokens found");
        return { success: true, sent: 0, errors: [] };
      }

      console.log(`Sending to ${validTokens.length} valid tokens`);

      // Send notifications in batches of 100 (Expo's limit)
      const batchSize = 100;
      const batches = [];
      for (let i = 0; i < validTokens.length; i += batchSize) {
        batches.push(validTokens.slice(i, i + batchSize));
      }

      let totalSent = 0;
      const errors = [];
      const invalidTokens = [];

      for (const batch of batches) {
        const result = await this.sendBatchNotifications(batch, notification);

        if (result.success && result.data) {
          if (Array.isArray(result.data)) {
            // Handle array response
            result.data.forEach((ticketResult, index) => {
              if (ticketResult.status === "ok") {
                totalSent++;
              } else {
                const token = batch[index];
                console.error(
                  `Push notification error for token ${token}:`,
                  ticketResult
                );

                // Check for invalid token errors
                if (
                  ticketResult.details &&
                  (ticketResult.details.error === "DeviceNotRegistered" ||
                    ticketResult.details.error === "InvalidCredentials")
                ) {
                  invalidTokens.push(token);
                }

                errors.push({
                  token: token,
                  error: ticketResult.message || "Unknown error",
                });
              }
            });
          } else if (result.data.status === "ok") {
            // Handle single response
            totalSent += batch.length;
          }
        } else {
          console.error("Batch send failed:", result.error);
          errors.push({
            tokens: batch,
            error: result.error,
          });
        }

        // Small delay between batches to avoid rate limiting
        if (batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Deactivate invalid tokens
      if (invalidTokens.length > 0) {
        await PushToken.updateMany(
          { pushToken: { $in: invalidTokens } },
          { $set: { isActive: false, updatedAt: new Date() } }
        );
        console.log(`Deactivated ${invalidTokens.length} invalid push tokens`);
      }

      console.log(
        `Push notification send completed. Success: ${totalSent}, Errors: ${errors.length}`
      );

      return {
        success: true,
        sent: totalSent,
        errors: errors,
        totalTokens: activeTokens.length,
        validTokens: validTokens.length,
        deactivatedTokens: invalidTokens.length,
      };
    } catch (error) {
      console.error("Error in sendToAllUsers:", error);
      return {
        success: false,
        error: error.message,
        sent: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Send notification for new app version/build
   * @param {string} version - App version
   * @param {string} buildType - Build type (major, minor, patch)
   * @param {string} buildUrl - Download URL (optional)
   * @param {string} customTitle - Custom notification title (optional)
   * @param {string} customBody - Custom notification body (optional)
   * @returns {Promise} Result of sending notifications
   */
  async sendNewVersionNotification(
    version,
    buildType = "update",
    buildUrl = null,
    customTitle = null,
    customBody = null
  ) {
    const defaultTitles = {
      major: "🎉 Major Update Available!",
      minor: "✨ New Features Available!",
      patch: "🔧 Bug Fixes & Improvements",
    };

    const defaultBodies = {
      major: `Version ${version} is here with exciting new features! Update now to get the latest experience.`,
      minor: `Version ${version} brings new features and improvements. Update to explore what's new!`,
      patch: `Version ${version} includes important bug fixes and performance improvements.`,
    };

    const notification = {
      title: customTitle || defaultTitles[buildType] || defaultTitles.patch,
      body: customBody || defaultBodies[buildType] || defaultBodies.patch,
      data: {
        type: "version_update",
        version: version,
        buildType: buildType,
        url: buildUrl,
        timestamp: new Date().toISOString(),
      },
    };

    return await this.sendToAllUsers(notification);
  }
}

module.exports = new PushNotificationService();
