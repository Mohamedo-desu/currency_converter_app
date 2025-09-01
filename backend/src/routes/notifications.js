const express = require("express");
const pushNotificationService = require("../services/pushNotificationService");
const router = express.Router();

// Send new version notification
router.post("/new-version", async (req, res) => {
  try {
    const { version, buildType, buildUrl, title, body } = req.body;

    if (!version) {
      return res.status(400).json({
        success: false,
        message: "Version is required",
      });
    }

    const result = await pushNotificationService.sendNewVersionNotification(
      version,
      buildType,
      buildUrl,
      title,
      body
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending new version notification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while sending version notification",
    });
  }
});

// Webhook endpoint for GitHub Actions
router.post("/webhook/new-build", async (req, res) => {
  try {
    const { version, buildType, ref, repository, buildUrl, title, body } =
      req.body;

    // Validate webhook payload
    if (!version || !repository) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    console.log(`Received webhook for new build: ${version} (${buildType})`);

    // Send notification about new build
    const result = await pushNotificationService.sendNewVersionNotification(
      version,
      buildType || "update",
      buildUrl,
      title,
      body
    );

    // Log the result
    console.log(`Notification sent for build ${version}:`, {
      sent: result.sent,
      errors: result.errors.length,
      totalTokens: result.totalTokens,
    });

    res.json({
      success: true,
      message: `Notification sent for version ${version}`,
      result,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while processing webhook",
    });
  }
});

module.exports = router;
