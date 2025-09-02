const express = require("express");
const PushToken = require("../models/PushToken");
const router = express.Router();

// Register a new push token
router.post("/register", async (req, res) => {
  try {
    const {
      pushToken,
      deviceId,
      platform,
      deviceName,
      deviceType,
      modelName,
      brand,
      manufacturer,
      osName,
      osVersion,
    } = req.body;

    // Validate required fields
    if (!pushToken || !deviceId || !platform) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: pushToken, deviceId, or platform",
      });
    }

    // Validate platform
    if (!["ios", "android", "web"].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform. Must be ios, android, or web",
      });
    }

    // Check if this exact token already exists and is active
    const existingToken = await PushToken.findOne({
      pushToken,
      isActive: true,
    });

    if (existingToken) {
      // Update last used timestamp
      existingToken.lastUsed = new Date();
      await existingToken.save();

      return res.json({
        success: true,
        message: "Push token already registered and active",
        tokenId: existingToken._id,
        alreadyExists: true,
      });
    }

    // Create new push token entry
    const newPushToken = new PushToken({
      pushToken,
      deviceId,
      platform,
      deviceName,
      deviceType,
      modelName,
      brand,
      manufacturer,
      osName,
      osVersion,
      isActive: true,
      lastUsed: new Date(),
    });

    const savedToken = await newPushToken.save();

    // Deactivate any old tokens for this device/platform combination
    await PushToken.deactivateOldTokensForDevice(
      deviceId,
      platform,
      savedToken._id
    );

    res.status(201).json({
      success: true,
      message: "Push token registered successfully",
      tokenId: savedToken._id,
    });
  } catch (error) {
    console.error("Error registering push token:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Push token already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while registering push token",
    });
  }
});

// Get active tokens for a device
router.get("/device/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { platform } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    let query = { deviceId, isActive: true };
    if (platform) {
      query.platform = platform;
    }

    const tokens = await PushToken.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      tokens: tokens.map((token) => ({
        id: token._id,
        platform: token.platform,
        lastUsed: token.lastUsed,
        createdAt: token.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching device tokens:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching tokens",
    });
  }
});

// Deactivate a push token
router.post("/deactivate", async (req, res) => {
  try {
    const { pushToken, deviceId } = req.body;

    if (!pushToken && !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Either pushToken or deviceId is required",
      });
    }

    let query = { isActive: true };
    if (pushToken) {
      query.pushToken = pushToken;
    } else {
      query.deviceId = deviceId;
    }

    const result = await PushToken.updateMany(query, {
      $set: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Deactivated ${result.modifiedCount} push token(s)`,
      deactivatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error deactivating push token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deactivating token",
    });
  }
});

// Get all active tokens (for admin/debugging purposes)
router.get("/active", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const tokens = await PushToken.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PushToken.countDocuments({ isActive: true });

    res.json({
      success: true,
      tokens: tokens.map((token) => ({
        id: token._id,
        deviceId: token.deviceId,
        platform: token.platform,
        lastUsed: token.lastUsed,
        createdAt: token.createdAt,
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalTokens: total,
      },
    });
  } catch (error) {
    console.error("Error fetching active tokens:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching active tokens",
    });
  }
});

// Cleanup old inactive tokens
router.post("/cleanup", async (req, res) => {
  try {
    const result = await PushToken.cleanupOldTokens();

    res.json({
      success: true,
      message: "Cleanup completed successfully",
      deletedCount: result?.deletedCount || 0,
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during cleanup",
    });
  }
});

module.exports = router;
